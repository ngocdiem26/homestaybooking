package com.homestaybooking.service;

import com.homestaybooking.dto.response.PublicDestinationResponse;
import com.homestaybooking.dto.response.PublicHomestayImageResponse;
import com.homestaybooking.dto.response.PublicHomestayResponse;
import com.homestaybooking.dto.response.PublicHomestayServiceResponse;
import com.homestaybooking.entity.Homestay;
import com.homestaybooking.entity.HomestayImage;
import com.homestaybooking.repository.HomestayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicHomestayService {

    private static final List<String> HIDDEN_STATUSES = List.of("REJECTED", "BLOCKED", "DELETED");

    private final HomestayRepository homestayRepository;
    private final JdbcTemplate jdbcTemplate;

    public List<PublicDestinationResponse> getDestinations() {
        List<PublicDestinationResponse> configured = getConfiguredDestinations();
        if (!configured.isEmpty()) {
            return configured;
        }
        return getDestinationsFromHomestays();
    }

    public PublicHomestayResponse getHomestayDetail(Integer homeId) {
        Homestay homestay = homestayRepository.findByHomeIdAndDeletedAtIsNull(homeId)
                .filter(this::isVisiblePublicly)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy homestay"));
        return toResponse(homestay);
    }
    public List<PublicHomestayResponse> getHomestays(
            String destination,
            BigDecimal maxPrice,
            List<String> amenities,
            List<String> services,
            String sort
    ) {
        String keyword = normalize(destination);
        List<String> normalizedAmenities = normalizeList(amenities);
        List<String> normalizedServices = normalizeList(services);

        List<PublicHomestayResponse> responses = homestayRepository.findByDeletedAtIsNull().stream()
                .filter(this::isVisiblePublicly)
                .map(this::toResponse)
                .filter(item -> matchesDestination(item, keyword))
                .filter(item -> maxPrice == null || item.getPricePerNight().compareTo(maxPrice) <= 0)
                .filter(item -> matchesAll(item.getAmenities(), normalizedAmenities))
                .filter(item -> matchesAll(item.getServices(), normalizedServices))
                .collect(Collectors.toCollection(ArrayList::new));

        responses.sort(resolveComparator(sort));
        return responses;
    }

    private List<PublicDestinationResponse> getConfiguredDestinations() {
        try {
            return jdbcTemplate.query(
                    "select d.destination_id, d.province_name, d.display_name, d.slug, d.description, d.thumbnail_url, "
                            + "d.display_order, count(h.home_id) as homestay_count "
                            + "from destinations d "
                            + "left join homestays h on h.deleted_at is null "
                            + "and upper(coalesce(h.status, '')) not in ('REJECTED','BLOCKED','DELETED') "
                            + "and h.province = d.province_name "
                            + "where d.deleted_at is null and d.destination_status = 'ACTIVE' "
                            + "group by d.destination_id, d.province_name, d.display_name, d.slug, d.description, d.thumbnail_url, d.display_order "
                            + "order by d.display_order asc, d.destination_id asc",
                    (rs, rowNum) -> PublicDestinationResponse.builder()
                            .destinationId(rs.getInt("destination_id"))
                            .provinceName(rs.getString("province_name"))
                            .displayName(rs.getString("display_name"))
                            .slug(rs.getString("slug"))
                            .description(rs.getString("description"))
                            .thumbnailUrl(rs.getString("thumbnail_url"))
                            .displayOrder(rs.getInt("display_order"))
                            .homestayCount(rs.getLong("homestay_count"))
                            .build()
            );
        } catch (DataAccessException ignored) {
            return List.of();
        }
    }

    private List<PublicDestinationResponse> getDestinationsFromHomestays() {
        return jdbcTemplate.query(
                "select h.province, count(distinct h.home_id) as homestay_count, "
                        + "coalesce(min(case when hi.is_main = true then hi.image_url end), min(hi.image_url)) as thumbnail_url "
                        + "from homestays h "
                        + "left join homestay_images hi on hi.home_id = h.home_id "
                        + "where h.deleted_at is null and upper(coalesce(h.status, '')) not in ('REJECTED','BLOCKED','DELETED') "
                        + "group by h.province order by homestay_count desc, h.province asc",
                (rs, rowNum) -> {
                    String province = rs.getString("province");
                    return PublicDestinationResponse.builder()
                            .destinationId(rowNum + 1)
                            .provinceName(province)
                            .displayName(toDestinationDisplayName(province))
                            .slug(toSlug(province))
                            .description("Khám phá " + province + " cùng các homestay đang có trên Cozygo")
                            .thumbnailUrl(defaultThumbnail(rs.getString("thumbnail_url"), province))
                            .displayOrder(rowNum + 1)
                            .homestayCount(rs.getLong("homestay_count"))
                            .build();
                }
        );
    }

    private PublicHomestayResponse toResponse(Homestay homestay) {
        List<PublicHomestayImageResponse> images = toImages(homestay);
        List<String> amenities = getAmenityNames(homestay.getHomeId());
        List<PublicHomestayServiceResponse> serviceItems = getServiceResponses(homestay.getHomeId());
        List<String> serviceNames = serviceItems.stream()
                .map(PublicHomestayServiceResponse::getServiceName)
                .filter(name -> name != null && !name.isBlank())
                .toList();
        List<String> rules = getRules(homestay.getHomeId());
        BigDecimal price = defaultMoney(homestay.getPricePerNight());
        BigDecimal discount = defaultMoney(homestay.getDiscountPercent());
        BigDecimal oldPrice = discount.compareTo(BigDecimal.ZERO) > 0
                ? price.multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(100).subtract(discount), 0, java.math.RoundingMode.HALF_UP)
                : price.multiply(BigDecimal.valueOf(1.18));
        Integer ratingCount = homestay.getRatingCount() == null ? 0 : homestay.getRatingCount();
        BigDecimal rating = defaultMoney(homestay.getRatingAvg());
        String mainImage = images.isEmpty() ? defaultThumbnail(null, homestay.getProvince()) : images.get(0).getImageUrl();

        return PublicHomestayResponse.builder()
                .id(homestay.getHomeId())
                .homeId(homestay.getHomeId())
                .code("HMS-" + String.format("%03d", homestay.getHomeId()))
                .name(homestay.getHomeName())
                .homeName(homestay.getHomeName())
                .address(homestay.getHomeAddress())
                .homeAddress(homestay.getHomeAddress())
                .city(homestay.getProvince())
                .province(homestay.getProvince())
                .location(homestay.getProvince())
                .description(homestay.getHomeDescription())
                .homeDescription(homestay.getHomeDescription())
                .pricePerNight(price)
                .price(formatNumber(price))
                .oldPrice(formatNumber(oldPrice))
                .status(homestay.getStatus())
                .discountPercent(discount)
                .maxGuest(defaultInt(homestay.getMaxGuest()))
                .rating(rating)
                .ratingAvg(rating)
                .reviewCount(ratingCount)
                .reviewsCount(ratingCount)
                .score(formatRating(rating))
                .reviewText(toReviewText(rating))
                .bedroomCount(defaultInt(homestay.getBedroomCount()))
                .bathroomCount(defaultInt(homestay.getBathroomCount()))
                .kitchenCount(defaultInt(homestay.getKitchenCount()))
                .livingRoomCount(defaultInt(homestay.getLivingRoomCount()))
                .bedCount(defaultInt(homestay.getBedCount()))
                .checkinTime(homestay.getCheckinTime())
                .checkoutTime(homestay.getCheckoutTime())
                .roomType("Homestay riêng tư tại " + homestay.getProvince())
                .details(defaultInt(homestay.getBedroomCount()) + " phòng ngủ • "
                        + defaultInt(homestay.getBathroomCount()) + " phòng tắm • "
                        + defaultInt(homestay.getKitchenCount()) + " bếp • "
                        + defaultInt(homestay.getLivingRoomCount()) + " phòng khách")
                .beds(defaultInt(homestay.getBedCount()) + " giường • phù hợp " + defaultInt(homestay.getMaxGuest()) + " khách")
                .distance("Khu vực " + homestay.getProvince())
                .alert(discount.compareTo(BigDecimal.ZERO) > 0 ? "Đang có ưu đãi " + discount.stripTrailingZeros().toPlainString() + "%" : "Có thể đặt cho chuyến đi sắp tới")
                .orders(Math.max(0, ratingCount * 3 + homestay.getHomeId()))
                .tax("Đã bao gồm thuế và phí dịch vụ cơ bản")
                .img(mainImage)
                .ownerName(homestay.getOwner() == null ? null : homestay.getOwner().getFullName())
                .images(images)
                .amenities(amenities)
                .services(serviceNames)
                .serviceItems(serviceItems)
                .rules(rules)
                .build();
    }

    private List<PublicHomestayImageResponse> toImages(Homestay homestay) {
        return homestay.getImages().stream()
                .sorted(Comparator
                        .comparing((HomestayImage image) -> Boolean.TRUE.equals(image.getIsMain()) ? 0 : 1)
                        .thenComparing(image -> image.getSortOrder() == null ? 999 : image.getSortOrder())
                        .thenComparing(image -> image.getImageId() == null ? 999 : image.getImageId()))
                .map(image -> PublicHomestayImageResponse.builder()
                        .imageId(image.getImageId())
                        .imageUrl(image.getImageUrl())
                        .url(image.getImageUrl())
                        .isMain(Boolean.TRUE.equals(image.getIsMain()))
                        .sortOrder(image.getSortOrder())
                        .build())
                .toList();
    }

    private List<String> getAmenityNames(Integer homeId) {
        try {
            return jdbcTemplate.queryForList(
                    "select a.amenity_name from homestay_amenities ha join amenities a on a.amenity_id = ha.amenity_id where ha.home_id = ? order by a.amenity_name",
                    String.class,
                    homeId
            );
        } catch (DataAccessException ignored) {
            return List.of();
        }
    }

    private List<PublicHomestayServiceResponse> getServiceResponses(Integer homeId) {
        try {
            return jdbcTemplate.query(
                    "select hs.homestay_service_id, s.service_id, s.service_name, s.description, hs.price, hs.status "
                            + "from homestay_services hs join services s on s.service_id = hs.service_id "
                            + "where hs.home_id = ? order by s.service_name",
                    (rs, rowNum) -> PublicHomestayServiceResponse.builder()
                            .homestayServiceId(rs.getInt("homestay_service_id"))
                            .serviceId(rs.getInt("service_id"))
                            .serviceName(rs.getString("service_name"))
                            .name(rs.getString("service_name"))
                            .description(rs.getString("description"))
                            .price(rs.getBigDecimal("price"))
                            .status(rs.getString("status"))
                            .build(),
                    homeId
            );
        } catch (DataAccessException ignored) {
            return List.of();
        }
    }

    private List<String> getRules(Integer homeId) {
        try {
            return jdbcTemplate.queryForList(
                    "select rule_content from rules where home_id = ? order by rule_id",
                    String.class,
                    homeId
            );
        } catch (DataAccessException ignored) {
            return List.of();
        }
    }

    private boolean isVisiblePublicly(Homestay homestay) {
        String status = homestay.getStatus() == null ? "" : homestay.getStatus().toUpperCase(Locale.ROOT);
        return !HIDDEN_STATUSES.contains(status);
    }

    private boolean matchesDestination(PublicHomestayResponse item, String keyword) {
        if (keyword == null || keyword.isBlank() || keyword.equals(normalize("Tất cả địa điểm"))) {
            return true;
        }
        return normalize(item.getName()).contains(keyword)
                || normalize(item.getProvince()).contains(keyword)
                || normalize(item.getCity()).contains(keyword);
    }

    private boolean matchesAll(List<String> source, List<String> selected) {
        if (selected.isEmpty()) return true;
        List<String> normalizedSource = normalizeList(source);
        return selected.stream().allMatch(needle -> normalizedSource.stream().anyMatch(value -> value.contains(needle) || needle.contains(value)));
    }

    private Comparator<PublicHomestayResponse> resolveComparator(String sort) {
        String normalized = sort == null ? "recommended" : sort;
        return switch (normalized) {
            case "priceAsc" -> Comparator.comparing(PublicHomestayResponse::getPricePerNight);
            case "priceDesc" -> Comparator.comparing(PublicHomestayResponse::getPricePerNight).reversed();
            case "rating" -> Comparator.comparing(PublicHomestayResponse::getRatingAvg, Comparator.nullsLast(Comparator.naturalOrder())).reversed();
            case "popular" -> Comparator.comparing(PublicHomestayResponse::getOrders, Comparator.nullsLast(Comparator.naturalOrder())).reversed();
            default -> (left, right) -> {
                int ratingCompare = nullSafeMoney(right.getRatingAvg()).compareTo(nullSafeMoney(left.getRatingAvg()));
                if (ratingCompare != 0) return ratingCompare;
                return Integer.compare(defaultInt(right.getOrders()), defaultInt(left.getOrders()));
            };
        };
    }

    private List<String> normalizeList(List<String> values) {
        if (values == null) return List.of();
        return values.stream()
                .filter(value -> value != null && !value.isBlank())
                .map(this::normalize)
                .toList();
    }

    private String normalize(String value) {
        if (value == null) return "";
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return normalized.toLowerCase(Locale.ROOT).trim();
    }

    private String toSlug(String value) {
        return normalize(value).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }

    private String toDestinationDisplayName(String province) {
        return switch (province) {
            case "Lâm Đồng" -> "Đà Lạt Mộng Mơ";
            case "Cần Thơ" -> "Cần Thơ Sông Nước";
            case "Đà Nẵng" -> "Đà Nẵng Biển Xanh";
            case "Lào Cai" -> "Sapa Tây Bắc";
            default -> province;
        };
    }

    private String defaultThumbnail(String thumbnail, String province) {
        if (thumbnail != null && !thumbnail.isBlank()) return thumbnail;
        return switch (province == null ? "" : province) {
            case "Lâm Đồng" -> "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=900&auto=format&fit=crop";
            case "Cần Thơ" -> "https://images.unsplash.com/photo-1549693578-d683be217e58?q=80&w=900&auto=format&fit=crop";
            case "Đà Nẵng" -> "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=900&auto=format&fit=crop";
            default -> "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=900&auto=format&fit=crop";
        };
    }

    private BigDecimal nullSafeMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private BigDecimal defaultMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private Integer defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private String formatNumber(BigDecimal value) {
        return String.format(Locale.US, "%,.0f", value == null ? BigDecimal.ZERO : value).replace(',', '.');
    }

    private String formatRating(BigDecimal rating) {
        return String.format(Locale.US, "%.1f", defaultMoney(rating));
    }

    private String toReviewText(BigDecimal rating) {
        double score = defaultMoney(rating).doubleValue();
        if (score >= 4.8) return "Xuất sắc";
        if (score >= 4.5) return "Tuyệt vời";
        if (score >= 4.0) return "Rất tốt";
        return "Mới trên Cozygo";
    }
}



