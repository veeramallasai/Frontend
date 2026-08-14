package com.farmtohome.catalog.service.delivery;

import com.farmtohome.catalog.dto.delivery.partner.CurrentDeliveryDto;
import com.farmtohome.catalog.dto.delivery.partner.DashboardSummaryDto;
import com.farmtohome.catalog.dto.delivery.partner.EarningsPointDto;
import com.farmtohome.catalog.dto.delivery.partner.RatingsDto;
import com.farmtohome.catalog.dto.delivery.partner.RecentDeliveryDto;
import com.farmtohome.catalog.dto.delivery.partner.UpcomingDeliveryDto;
import com.farmtohome.catalog.entity.DeliveryPartnerProfile;
import com.farmtohome.catalog.entity.DeliveryTask;
import com.farmtohome.catalog.entity.UserAccount;
import com.farmtohome.catalog.enums.DeliveryPartnerAvailabilityStatus;
import com.farmtohome.catalog.enums.DeliveryTaskStatus;
import com.farmtohome.catalog.enums.UserRole;
import com.farmtohome.catalog.repository.DeliveryPartnerProfileRepository;
import com.farmtohome.catalog.repository.DeliveryTaskRepository;
import com.farmtohome.catalog.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.Principal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeliveryPartnerDashboardService {

    private static final Set<DeliveryTaskStatus> ACTIVE_STATUSES = EnumSet.of(
        DeliveryTaskStatus.ACCEPTED,
        DeliveryTaskStatus.PICKUP_STARTED,
        DeliveryTaskStatus.PICKED_UP,
        DeliveryTaskStatus.OUT_FOR_DELIVERY
    );

    private static final Set<DeliveryTaskStatus> UPCOMING_STATUSES = EnumSet.of(
        DeliveryTaskStatus.ASSIGNED,
        DeliveryTaskStatus.ACCEPTED,
        DeliveryTaskStatus.PICKUP_STARTED
    );

    private final UserRepository userRepository;
    private final DeliveryPartnerProfileRepository profileRepository;
    private final DeliveryTaskRepository taskRepository;

    public DashboardSummaryDto getSummary(Principal principal) {
        UserAccount partner = getPartnerUser(principal);
        DeliveryPartnerProfile profile = getActiveProfile(partner.getId());
        List<DeliveryTask> tasks = taskRepository.findByPartnerUserIdOrderByCreatedAtDesc(partner.getId());

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);

        long todaysDeliveries = tasks.stream().filter(task -> isSameDate(task.getScheduledTime(), today)).count();
        long activeDeliveries = tasks.stream().filter(task -> ACTIVE_STATUSES.contains(task.getStatus())).count();
        long pendingPickups = tasks.stream().filter(task -> task.getStatus() == DeliveryTaskStatus.ASSIGNED).count();
        long completedToday = tasks.stream().filter(task -> task.getStatus() == DeliveryTaskStatus.DELIVERED && isSameDate(task.getDeliveredAt(), today)).count();

        BigDecimal todaysEarnings = tasks.stream()
            .filter(task -> task.getStatus() == DeliveryTaskStatus.DELIVERED && isSameDate(task.getDeliveredAt(), today))
            .map(this::safeEarnings)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal weeklyEarnings = tasks.stream()
            .filter(task -> task.getStatus() == DeliveryTaskStatus.DELIVERED && task.getDeliveredAt() != null && !task.getDeliveredAt().toLocalDate().isBefore(weekStart))
            .map(this::safeEarnings)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (DeliveryPartnerAvailabilityStatus.OFFLINE.name().equalsIgnoreCase(profile.getAvailabilityStatus()) && activeDeliveries == 0) {
            weeklyEarnings = weeklyEarnings.setScale(2, RoundingMode.HALF_UP);
        }

        return DashboardSummaryDto.builder()
            .availabilityStatus(profile.getAvailabilityStatus())
            .todaysDeliveries(todaysDeliveries)
            .activeDeliveries(activeDeliveries)
            .pendingPickups(pendingPickups)
            .completedToday(completedToday)
            .todaysEarnings(todaysEarnings)
            .weeklyEarnings(weeklyEarnings)
            .build();
    }

    public CurrentDeliveryDto getCurrentDelivery(Principal principal) {
        UserAccount partner = getPartnerUser(principal);
        getActiveProfile(partner.getId());

        return taskRepository.findByPartnerUserIdOrderByCreatedAtDesc(partner.getId()).stream()
            .filter(task -> ACTIVE_STATUSES.contains(task.getStatus()))
            .findFirst()
            .map(this::toCurrentDelivery)
            .orElse(null);
    }

    public List<UpcomingDeliveryDto> getUpcomingDeliveries(Principal principal, int limit) {
        UserAccount partner = getPartnerUser(principal);
        getActiveProfile(partner.getId());

        return taskRepository.findByPartnerUserIdOrderByCreatedAtDesc(partner.getId()).stream()
            .filter(task -> UPCOMING_STATUSES.contains(task.getStatus()))
            .sorted(Comparator.comparing(DeliveryTask::getScheduledTime, Comparator.nullsLast(Comparator.naturalOrder())))
            .limit(Math.max(1, limit))
            .map(task -> UpcomingDeliveryDto.builder()
                .orderId(task.getOrderCode())
                .customerName(task.getCustomerName())
                .location(task.getDeliveryLocation())
                .scheduledTime(task.getScheduledTime())
                .status(task.getStatus().name())
                .build())
            .toList();
    }

    public List<RecentDeliveryDto> getRecentDeliveries(Principal principal, int limit) {
        UserAccount partner = getPartnerUser(principal);
        getActiveProfile(partner.getId());

        return taskRepository.findByPartnerUserIdOrderByCreatedAtDesc(partner.getId()).stream()
            .filter(task -> task.getStatus() == DeliveryTaskStatus.DELIVERED)
            .sorted(Comparator.comparing(DeliveryTask::getDeliveredAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .limit(Math.max(1, limit))
            .map(task -> RecentDeliveryDto.builder()
                .orderId(task.getOrderCode())
                .customerName(task.getCustomerName())
                .amount(task.getOrderAmount())
                .status(task.getStatus().name())
                .deliveredOn(task.getDeliveredAt())
                .build())
            .toList();
    }

    public List<EarningsPointDto> getEarningsSummary(Principal principal) {
        UserAccount partner = getPartnerUser(principal);
        getActiveProfile(partner.getId());

        List<DeliveryTask> delivered = taskRepository.findByPartnerUserIdOrderByCreatedAtDesc(partner.getId()).stream()
            .filter(task -> task.getStatus() == DeliveryTaskStatus.DELIVERED && task.getDeliveredAt() != null)
            .toList();

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        List<LocalDate> weekDays = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            weekDays.add(weekStart.plusDays(i));
        }

        Map<LocalDate, BigDecimal> byDay = delivered.stream().collect(
            Collectors.groupingBy(task -> task.getDeliveredAt().toLocalDate(),
                Collectors.mapping(this::safeEarnings, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)))
        );

        return weekDays.stream().map(day -> EarningsPointDto.builder()
            .day(day.getDayOfWeek().name().substring(0, 3).toLowerCase(Locale.ENGLISH))
            .amount(byDay.getOrDefault(day, BigDecimal.ZERO))
            .build())
            .toList();
    }

    public RatingsDto getRatings(Principal principal) {
        UserAccount partner = getPartnerUser(principal);
        getActiveProfile(partner.getId());

        List<DeliveryTask> ratedTasks = taskRepository.findByPartnerUserIdOrderByCreatedAtDesc(partner.getId()).stream()
            .filter(task -> task.getCustomerRating() != null && task.getCustomerRating() >= 1 && task.getCustomerRating() <= 5)
            .toList();

        long totalRatings = ratedTasks.size();
        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int star = 5; star >= 1; star--) {
            int currentStar = star;
            distribution.put(star, ratedTasks.stream().filter(task -> task.getCustomerRating() == currentStar).count());
        }

        double overallRating = totalRatings == 0
            ? 0.0
            : ratedTasks.stream().mapToInt(DeliveryTask::getCustomerRating).average().orElse(0.0);

        return RatingsDto.builder()
            .overallRating(Math.round(overallRating * 10.0) / 10.0)
            .totalRatings(totalRatings)
            .distribution(distribution)
            .build();
    }

    @Transactional
    public Map<String, Object> updateOnlineStatus(Principal principal, String status) {
        UserAccount partner = getPartnerUser(principal);
        DeliveryPartnerProfile profile = getActiveProfile(partner.getId());

        DeliveryPartnerAvailabilityStatus normalized;
        try {
            normalized = DeliveryPartnerAvailabilityStatus.valueOf(String.valueOf(status).trim().toUpperCase(Locale.ENGLISH));
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid status. Use ONLINE or OFFLINE");
        }

        profile.setAvailabilityStatus(normalized.name());
        profileRepository.save(profile);

        Map<String, Object> response = new HashMap<>();
        response.put("status", normalized.name());
        response.put("updatedAt", LocalDateTime.now());
        return response;
    }

    @Transactional
    public CurrentDeliveryDto updateDeliveryStatus(Principal principal, String orderCode, String status) {
        UserAccount partner = getPartnerUser(principal);
        DeliveryPartnerProfile profile = getActiveProfile(partner.getId());

        DeliveryTask task = taskRepository.findByPartnerUserIdAndOrderCodeIgnoreCase(partner.getId(), orderCode)
            .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        DeliveryTaskStatus targetStatus;
        try {
            targetStatus = DeliveryTaskStatus.valueOf(String.valueOf(status).trim().toUpperCase(Locale.ENGLISH));
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid delivery status");
        }

        DeliveryTaskStatus currentStatus = task.getStatus();
        if (!isValidTransition(currentStatus, targetStatus)) {
            throw new IllegalArgumentException("Invalid status transition from " + currentStatus.name() + " to " + targetStatus.name());
        }

        if (targetStatus == DeliveryTaskStatus.ACCEPTED
            && !DeliveryPartnerAvailabilityStatus.ONLINE.name().equalsIgnoreCase(profile.getAvailabilityStatus())) {
            throw new IllegalArgumentException("Partner must be ONLINE to accept delivery assignments");
        }

        task.setStatus(targetStatus);
        if (targetStatus == DeliveryTaskStatus.PICKED_UP) {
            task.setPickedUpAt(LocalDateTime.now());
        }
        if (targetStatus == DeliveryTaskStatus.DELIVERED) {
            task.setDeliveredAt(LocalDateTime.now());
        }

        DeliveryTask saved = taskRepository.save(task);
        return toCurrentDelivery(saved);
    }

    private boolean isValidTransition(DeliveryTaskStatus currentStatus, DeliveryTaskStatus targetStatus) {
        return switch (currentStatus) {
            case ASSIGNED -> targetStatus == DeliveryTaskStatus.ACCEPTED;
            case ACCEPTED -> targetStatus == DeliveryTaskStatus.PICKUP_STARTED;
            case PICKUP_STARTED -> targetStatus == DeliveryTaskStatus.PICKED_UP;
            case PICKED_UP -> targetStatus == DeliveryTaskStatus.OUT_FOR_DELIVERY;
            case OUT_FOR_DELIVERY -> targetStatus == DeliveryTaskStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }

    private CurrentDeliveryDto toCurrentDelivery(DeliveryTask task) {
        return CurrentDeliveryDto.builder()
            .orderId(task.getOrderCode())
            .status(task.getStatus().name())
            .customerName(task.getCustomerName())
            .customerPhone(task.getCustomerPhone())
            .pickupLocation(task.getPickupLocation())
            .deliveryLocation(task.getDeliveryLocation())
            .orderAmount(task.getOrderAmount())
            .paymentMethod(task.getPaymentMethod())
            .pickupLatitude(task.getPickupLatitude())
            .pickupLongitude(task.getPickupLongitude())
            .deliveryLatitude(task.getDeliveryLatitude())
            .deliveryLongitude(task.getDeliveryLongitude())
            .distanceKm(task.getDistanceKm())
            .estimatedMinutes(task.getEstimatedMinutes())
            .build();
    }

    private UserAccount getPartnerUser(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            throw new IllegalArgumentException("Unauthorized");
        }

        UserAccount user = userRepository.findByEmailIgnoreCase(principal.getName().trim())
            .orElseThrow(() -> new IllegalArgumentException("Unauthorized"));

        if (user.getRole() != UserRole.DELIVERY_PARTNER) {
            throw new IllegalArgumentException("Unauthorized role");
        }

        return user;
    }

    private DeliveryPartnerProfile getActiveProfile(Long userId) {
        DeliveryPartnerProfile profile = profileRepository.findByUserAccountId(userId)
            .orElseThrow(() -> new IllegalArgumentException("Delivery partner profile not found"));

        if (!profile.isAccountActive()) {
            throw new IllegalArgumentException("Delivery partner account is inactive");
        }

        return profile;
    }

    private boolean isSameDate(LocalDateTime dateTime, LocalDate date) {
        return dateTime != null && dateTime.toLocalDate().isEqual(date);
    }

    private BigDecimal safeEarnings(DeliveryTask task) {
        return Optional.ofNullable(task.getEarningsAmount()).orElse(BigDecimal.ZERO);
    }
}
