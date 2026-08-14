package com.farmtohome.catalog.service.deliverypartner;

import com.farmtohome.catalog.dto.deliverypartner.FaceEnrollmentRequestDto;
import com.farmtohome.catalog.dto.deliverypartner.FaceRegistrationResponse;
import com.farmtohome.catalog.dto.deliverypartner.FaceStatusResponse;
import com.farmtohome.catalog.dto.deliverypartner.FaceVerificationResponse;
import com.farmtohome.catalog.dto.deliverypartner.FaceVerifyRequestDto;
import com.farmtohome.catalog.security.UserAccountPrincipal;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

public interface DeliveryPartnerFaceService {

    Map<String, Object> getStatus(UserAccountPrincipal principal);

    FaceStatusResponse getFaceStatusResponse(UserAccountPrincipal principal);

    Map<String, Object> enroll(UserAccountPrincipal principal, FaceEnrollmentRequestDto request);

    FaceRegistrationResponse registerFace(UserAccountPrincipal principal, MultipartFile faceImage);

    Map<String, Object> verify(UserAccountPrincipal principal, FaceVerifyRequestDto request);

    FaceVerificationResponse verifyFace(UserAccountPrincipal principal, MultipartFile faceImage);
}
