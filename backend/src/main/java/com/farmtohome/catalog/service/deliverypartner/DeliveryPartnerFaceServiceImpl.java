package com.farmtohome.catalog.service.deliverypartner;

import com.farmtohome.catalog.dto.deliverypartner.FaceEnrollmentRequestDto;
import com.farmtohome.catalog.dto.deliverypartner.FaceRegistrationResponse;
import com.farmtohome.catalog.dto.deliverypartner.FaceStatusResponse;
import com.farmtohome.catalog.dto.deliverypartner.FaceVerificationResponse;
import com.farmtohome.catalog.dto.deliverypartner.FaceVerifyRequestDto;
import com.farmtohome.catalog.entity.DeliveryPartnerFaceProfile;
import com.farmtohome.catalog.enums.UserRole;
import com.farmtohome.catalog.repository.DeliveryPartnerFaceProfileRepository;
import com.farmtohome.catalog.security.UserAccountPrincipal;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.imageio.ImageIO;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class DeliveryPartnerFaceServiceImpl implements DeliveryPartnerFaceService {

    private static final double MIN_BRIGHTNESS = 25.0;
    private static final double MIN_SHARPNESS = 4.0;
    private static final int HASH_DISTANCE_THRESHOLD = 18;

    private final DeliveryPartnerFaceProfileRepository profileRepository;

    public DeliveryPartnerFaceServiceImpl(DeliveryPartnerFaceProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getStatus(UserAccountPrincipal principal) {
        ensureDeliveryPartner(principal);
        Optional<DeliveryPartnerFaceProfile> maybeProfile = profileRepository.findByUserId(principal.getId());

        boolean enrolled = maybeProfile.isPresent();
        boolean verified = maybeProfile
            .map(profile -> profile.getVerifiedUntil() != null && profile.getVerifiedUntil().isAfter(LocalDateTime.now()))
            .orElse(false);

        Map<String, Object> status = new LinkedHashMap<>();
        status.put("faceRegistered", enrolled);
        status.put("enrolled", enrolled);
        status.put("verified", verified);
        status.put("faceVerificationEnabled", true);
        status.put("message", enrolled ? "Face profile found" : "Face enrollment required");
        return status;
    }

    @Override
    @Transactional(readOnly = true)
    public FaceStatusResponse getFaceStatusResponse(UserAccountPrincipal principal) {
        ensureDeliveryPartner(principal);
        Optional<DeliveryPartnerFaceProfile> maybeProfile = profileRepository.findByUserId(principal.getId());
        boolean enrolled = maybeProfile.isPresent();
        return new FaceStatusResponse(
            enrolled,
            true,
            enrolled ? "Face profile found" : "Face enrollment required"
        );
    }

    @Override
    public Map<String, Object> enroll(UserAccountPrincipal principal, FaceEnrollmentRequestDto request) {
        ensureDeliveryPartner(principal);
        BufferedImage image = decodeImage(request.getImageBase64());
        saveFaceProfile(principal.getId(), image);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("enrolled", true);
        response.put("message", "Face registered successfully");
        return response;
    }

    @Override
    public FaceRegistrationResponse registerFace(UserAccountPrincipal principal, MultipartFile faceImage) {
        ensureDeliveryPartner(principal);
        if (faceImage == null || faceImage.isEmpty()) {
            throw new IllegalArgumentException("Face image is required for registration");
        }

        BufferedImage image = readMultipartImage(faceImage);
        saveFaceProfile(principal.getId(), image);

        return new FaceRegistrationResponse(true, "Face registered successfully");
    }

    @Override
    public Map<String, Object> verify(UserAccountPrincipal principal, FaceVerifyRequestDto request) {
        ensureDeliveryPartner(principal);
        DeliveryPartnerFaceProfile profile = profileRepository.findByUserId(principal.getId())
            .orElseThrow(() -> new IllegalStateException("Face registration not found. Please register your face first."));

        BufferedImage image = decodeImage(request.getImageBase64());
        return performVerification(profile, image);
    }

    @Override
    public FaceVerificationResponse verifyFace(UserAccountPrincipal principal, MultipartFile faceImage) {
        ensureDeliveryPartner(principal);
        if (faceImage == null || faceImage.isEmpty()) {
            return new FaceVerificationResponse(true, false, 0.0, "Face image is required for verification");
        }

        DeliveryPartnerFaceProfile profile = profileRepository.findByUserId(principal.getId())
            .orElseThrow(() -> new IllegalStateException("Face registration not found. Please register your face first."));

        BufferedImage image = readMultipartImage(faceImage);
        Map<String, Object> res = performVerification(profile, image);

        boolean matched = Boolean.TRUE.equals(res.get("matched")) || Boolean.TRUE.equals(res.get("verified"));
        double confidence = (Double) res.getOrDefault("confidence", 0.0);
        String message = (String) res.getOrDefault("message", matched ? "Face verification successful" : "Face verification failed");

        return new FaceVerificationResponse(true, matched, confidence, message);
    }

    private void saveFaceProfile(Long userId, BufferedImage image) {
        Quality quality = assessQuality(image);
        if (!quality.acceptable()) {
            throw new IllegalArgumentException(quality.message());
        }

        String templateHash = dHashHex(image);
        DeliveryPartnerFaceProfile profile = profileRepository.findByUserId(userId)
            .orElseGet(DeliveryPartnerFaceProfile::new);

        profile.setUserId(userId);
        profile.setTemplateHash(templateHash);
        profile.setEnrolledAt(LocalDateTime.now());
        profile.setFailedAttempts(0);
        profile.setLastVerifiedAt(null);
        profile.setVerifiedUntil(null);
        profile.setFaceRegistered(true);
        profile.setFaceVerificationEnabled(true);

        profileRepository.save(profile);
    }

    private Map<String, Object> performVerification(DeliveryPartnerFaceProfile profile, BufferedImage image) {
        Quality quality = assessQuality(image);
        if (!quality.acceptable()) {
            return verificationResult(false, 0.0, quality.message());
        }

        String probeHash = dHashHex(image);
        int distance = hammingDistance(profile.getTemplateHash(), probeHash);
        double confidence = Math.max(0.0, 1.0 - (distance / 64.0));
        confidence = round(confidence);

        if (distance > HASH_DISTANCE_THRESHOLD) {
            incrementFailedAttempts(profile);
            return verificationResult(false, confidence, "Face verification failed");
        }

        profile.setFailedAttempts(0);
        profile.setLastVerifiedAt(LocalDateTime.now());
        profile.setVerifiedUntil(LocalDateTime.now().plusHours(12));
        profileRepository.save(profile);

        return verificationResult(true, confidence, "Face verification successful");
    }

    private void ensureDeliveryPartner(UserAccountPrincipal principal) {
        if (principal == null || principal.getRole() != UserRole.DELIVERY_PARTNER) {
            throw new AccessDeniedException("Only DELIVERY_PARTNER accounts can access this endpoint.");
        }
    }

    private BufferedImage readMultipartImage(MultipartFile file) {
        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new IllegalArgumentException("Invalid image file format.");
            }
            return image;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Unable to process uploaded face image.");
        }
    }

    private BufferedImage decodeImage(String imageBase64) {
        try {
            String clean = imageBase64 == null ? "" : imageBase64.trim();
            if (clean.startsWith("data:")) {
                int commaIdx = clean.indexOf(',');
                clean = commaIdx > -1 ? clean.substring(commaIdx + 1) : clean;
            }
            byte[] bytes = Base64.getDecoder().decode(clean);
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(bytes));
            if (image == null) {
                throw new IllegalArgumentException("Invalid image payload for face verification.");
            }
            return image;
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Unable to decode face image.");
        }
    }

    private Quality assessQuality(BufferedImage image) {
        BufferedImage gray = toGrayscale(image);
        double brightness = meanBrightness(gray);
        double sharpness = gradientVariance(gray);

        if (brightness < MIN_BRIGHTNESS) {
            return new Quality(false, "Image is too dark. Please move to a well-lit area.");
        }
        if (sharpness < MIN_SHARPNESS) {
            return new Quality(false, "Image is too blurry. Please hold steady and try again.");
        }
        return new Quality(true, "OK");
    }

    private String dHashHex(BufferedImage image) {
        BufferedImage gray = toGrayscale(image);
        BufferedImage resized = new BufferedImage(9, 8, BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g2 = resized.createGraphics();
        g2.drawImage(gray, 0, 0, 9, 8, null);
        g2.dispose();

        StringBuilder bits = new StringBuilder(64);
        for (int y = 0; y < 8; y++) {
            for (int x = 0; x < 8; x++) {
                int left = resized.getRGB(x, y) & 0xFF;
                int right = resized.getRGB(x + 1, y) & 0xFF;
                bits.append(left > right ? '1' : '0');
            }
        }

        StringBuilder hex = new StringBuilder(16);
        for (int i = 0; i < bits.length(); i += 4) {
            int value = Integer.parseInt(bits.substring(i, i + 4), 2);
            hex.append(Integer.toHexString(value));
        }
        return hex.toString();
    }

    private int hammingDistance(String a, String b) {
        int length = Math.min(a.length(), b.length());
        int distance = 0;
        for (int i = 0; i < length; i++) {
            int av = Character.digit(a.charAt(i), 16);
            int bv = Character.digit(b.charAt(i), 16);
            distance += Integer.bitCount(av ^ bv);
        }
        return distance + Math.abs(a.length() - b.length()) * 4;
    }

    private BufferedImage toGrayscale(BufferedImage source) {
        BufferedImage gray = new BufferedImage(source.getWidth(), source.getHeight(), BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g2 = gray.createGraphics();
        g2.drawImage(source, 0, 0, null);
        g2.dispose();
        return gray;
    }

    private double meanBrightness(BufferedImage image) {
        long sum = 0;
        int w = image.getWidth();
        int h = image.getHeight();
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                sum += image.getRGB(x, y) & 0xFF;
            }
        }
        return sum / (double) (w * h);
    }

    private double gradientVariance(BufferedImage image) {
        int w = image.getWidth();
        int h = image.getHeight();
        if (w < 3 || h < 3) {
            return 0.0;
        }

        double sum = 0.0;
        double sumSq = 0.0;
        int count = 0;

        for (int y = 1; y < h - 1; y++) {
            for (int x = 1; x < w - 1; x++) {
                int center = image.getRGB(x, y) & 0xFF;
                int left = image.getRGB(x - 1, y) & 0xFF;
                int right = image.getRGB(x + 1, y) & 0xFF;
                int up = image.getRGB(x, y - 1) & 0xFF;
                int down = image.getRGB(x, y + 1) & 0xFF;

                int gx = right - left;
                int gy = down - up;
                double magnitude = Math.sqrt(gx * gx + gy * gy) + Math.abs(center - ((left + right + up + down) / 4.0));

                sum += magnitude;
                sumSq += magnitude * magnitude;
                count++;
            }
        }

        if (count == 0) {
            return 0.0;
        }
        double mean = sum / count;
        return (sumSq / count) - (mean * mean);
    }

    private void incrementFailedAttempts(DeliveryPartnerFaceProfile profile) {
        Integer attempts = profile.getFailedAttempts() == null ? 0 : profile.getFailedAttempts();
        profile.setFailedAttempts(attempts + 1);
        profile.setVerifiedUntil(null);
        profileRepository.save(profile);
    }

    private Map<String, Object> verificationResult(boolean verified, double confidence, String message) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("matched", verified);
        response.put("verified", verified);
        response.put("confidence", confidence);
        response.put("message", message);
        return response;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private record Quality(boolean acceptable, String message) {}
}
