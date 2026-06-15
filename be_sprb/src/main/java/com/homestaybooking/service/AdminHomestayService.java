package com.homestaybooking.service;

import com.homestaybooking.dto.request.UpdateHomestayStatusRequest;
import com.homestaybooking.dto.response.AdminHomestayResponse;
import com.homestaybooking.entity.Homestay;
import com.homestaybooking.entity.HomestayImage;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.HomestayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminHomestayService {

    private final HomestayRepository homestayRepository;

    @Transactional(readOnly = true)
    public List<AdminHomestayResponse> getHomestays() {
        return homestayRepository.findByDeletedAtIsNull().stream()
                .sorted(Comparator.comparing(Homestay::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminHomestayResponse updateStatus(Integer homeId, UpdateHomestayStatusRequest request) {
        Homestay homestay = getActiveHomestay(homeId);
        homestay.setStatus(normalizeStatus(request.getStatus()));
        return toResponse(homestayRepository.save(homestay));
    }

    @Transactional
    public void deleteHomestay(Integer homeId) {
        Homestay homestay = getActiveHomestay(homeId);
        homestay.setDeletedAt(LocalDateTime.now());
        homestayRepository.save(homestay);
    }

    private Homestay getActiveHomestay(Integer homeId) {
        Homestay homestay = homestayRepository.findById(homeId)
                .orElseThrow(() -> new AppException("Không tìm thấy homestay"));

        if (homestay.getDeletedAt() != null) {
            throw new AppException("Homestay đã bị xóa");
        }

        return homestay;
    }

    private String normalizeStatus(String status) {
        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();

        if (!List.of("PENDING", "APPROVED", "REJECTED", "BLOCKED").contains(normalizedStatus)) {
            throw new AppException("Trạng thái homestay không hợp lệ");
        }

        return normalizedStatus;
    }

    private AdminHomestayResponse toResponse(Homestay homestay) {
        return AdminHomestayResponse.builder()
                .homeId(homestay.getHomeId())
                .homeName(homestay.getHomeName())
                .homeAddress(homestay.getHomeAddress())
                .province(homestay.getProvince())
                .homeDescription(homestay.getHomeDescription())
                .pricePerNight(homestay.getPricePerNight())
                .status(homestay.getStatus())
                .discountPercent(homestay.getDiscountPercent())
                .maxGuest(homestay.getMaxGuest())
                .ratingAvg(homestay.getRatingAvg())
                .ratingCount(homestay.getRatingCount())
                .bedroomCount(homestay.getBedroomCount())
                .bathroomCount(homestay.getBathroomCount())
                .kitchenCount(homestay.getKitchenCount())
                .livingRoomCount(homestay.getLivingRoomCount())
                .bedCount(homestay.getBedCount())
                .checkinTime(homestay.getCheckinTime())
                .checkoutTime(homestay.getCheckoutTime())
                .mainImage(getMainImage(homestay))
                .ownerId(homestay.getOwner().getUserId())
                .ownerName(homestay.getOwner().getFullName())
                .ownerEmail(homestay.getOwner().getEmail())
                .ownerPhone(homestay.getOwner().getPhoneNumber())
                .createdAt(homestay.getCreatedAt())
                .updatedAt(homestay.getUpdatedAt())
                .build();
    }

    private String getMainImage(Homestay homestay) {
        return homestay.getImages().stream()
                .filter(image -> Boolean.TRUE.equals(image.getIsMain()))
                .findFirst()
                .map(HomestayImage::getImageUrl)
                .or(() -> homestay.getImages().stream().findFirst().map(HomestayImage::getImageUrl))
                .orElse(null);
    }
}
