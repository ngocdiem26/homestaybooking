package com.homestaybooking.service;

import com.homestaybooking.dto.response.PublicActivityImageResponse;
import com.homestaybooking.dto.response.PublicActivityResponse;
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
import java.util.LinkedHashMap;
import java.util.Map;
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "KhĂ´ng tĂ¬m tháº¥y homestay"));
        return toResponse(homestay);
    }

    public List<PublicActivityResponse> getActivities() {
        try {
            return queryActivities("activity_images");
        } catch (DataAccessException firstException) {
            try {
                return queryActivities("activities_img");
            } catch (DataAccessException secondException) {
                return List.of();
            }
        }
    }

    private List<PublicActivityResponse> queryActivities(String imageTable) {
        String sql = """
                select
                    a.activity_id,
                    a.activity_name,
                    a.province,
                    a.activity_address,
                    a.short_description,
                    a.description,
                    a.hotline,
                    a.thumbnail_url,
                    a.badge_text,
                    a.badge_type,
                    a.is_featured,
                    a.display_order,
                    ai.image_id,
                    ai.image_url,
                    ai.is_thumbnail,
                    ai.display_order as image_display_order
                from activities a
                left join %s ai on ai.activity_id = a.activity_id
                where a.deleted_at is null
                  and upper(coalesce(a.activity_status, 'ACTIVE')) = 'ACTIVE'
                order by a.is_featured desc,
                         a.display_order asc,
                         a.activity_id asc,
                         ai.is_thumbnail desc,
                         ai.display_order asc,
                         ai.image_id asc
                """.formatted(imageTable);

        Map<Integer, PublicActivityResponse> activities = new LinkedHashMap<>();
        jdbcTemplate.query(sql, rs -> {
            Integer activityId = rs.getInt("activity_id");
            PublicActivityResponse activity = activities.get(activityId);
            if (activity == null) {
                activity = PublicActivityResponse.builder()
                        .activityId(activityId)
                        .activityName(rs.getString("activity_name"))
                        .province(rs.getString("province"))
                        .activityAddress(rs.getString("activity_address"))


                        .shortDescription(rs.getString("short_description"))
                        .description(rs.getString("description"))
                        .hotline(rs.getString("hotline"))
                        .thumbnailUrl(rs.getString("thumbnail_url"))
                        .badgeText(rs.getString("badge_text"))
                        .badgeType(rs.getString("badge_type"))
                        .featured(rs.getBoolean("is_featured"))
                        .displayOrder(rs.getInt("display_order"))
                        .images(new ArrayList<>())
                        .build();
                activities.put(activityId, activity);
            }

            Long imageId = rs.getObject("image_id", Long.class);
            if (imageId != null) {
                activity.getImages().add(PublicActivityImageResponse.builder()
                        .imageId(imageId)
                        .imageUrl(rs.getString("image_url"))
                        .isThumbnail(rs.getBoolean("is_thumbnail"))
                        .displayOrder(rs.getInt("image_display_order"))
                        .build());
            }
        });

        return activities.values().stream()
                .peek(activity -> {
                    if ((activity.getThumbnailUrl() == null || activity.getThumbnailUrl().isBlank())
                            && activity.getImages() != null
                            && !activity.getImages().isEmpty()) {
                        activity.setThumbnailUrl(activity.getImages().get(0).getImageUrl());
                    }
                })
                .toList();
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

    private String readString(java.sql.ResultSet rs, String column) {
        try {
            return rs.getString(column);
        } catch (java.sql.SQLException exception) {
            return null;
        }
    }

    private List<PublicDestinationResponse> getConfiguredDestinations() {
        try {
            return jdbcTemplate.query(
                    "select d.destination_id, d.province_name, d.city, d.display_name, d.slug, d.description, d.thumbnail_url, "
                            + "d.display_order, count(h.home_id) as homestay_count "
                            + "from destinations d "
                            + "left join homestays h on h.deleted_at is null "
                            + "and upper(coalesce(h.status, '')) not in ('REJECTED','BLOCKED','DELETED') "
                            + "and (h.city = d.city or (coalesce(h.city, '') = '' and h.province = d.province_name) or h.province = d.city) "
                            + "where d.deleted_at is null and d.destination_status = 'ACTIVE' "
                            + "group by d.destination_id, d.province_name, d.city, d.display_name, d.slug, d.description, d.thumbnail_url, d.display_order "
                            + "order by d.display_order asc, d.destination_id asc",
                    (rs, rowNum) -> PublicDestinationResponse.builder()
                            .destinationId(rs.getInt("destination_id"))
                            .provinceName(rs.getString("province_name"))
                            .city(rs.getString("city"))
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
                "select h.province, coalesce(nullif(h.city, ''), h.province) as city, count(distinct h.home_id) as homestay_count, "
                        + "coalesce(min(case when hi.is_main = true then hi.image_url end), min(hi.image_url)) as thumbnail_url "
                        + "from homestays h "
                        + "left join homestay_images hi on hi.home_id = h.home_id "
                        + "where h.deleted_at is null and upper(coalesce(h.status, '')) not in ('REJECTED','BLOCKED','DELETED') "
                        + "group by h.province, coalesce(nullif(h.city, ''), h.province) order by homestay_count desc, city asc",
                (rs, rowNum) -> {
                    String province = rs.getString("province");
                    String city = rs.getString("city");
                    return PublicDestinationResponse.builder()
                            .destinationId(rowNum + 1)
                            .provinceName(province)
                            .city(city)
                            .displayName(toDestinationDisplayName(city))
                            .slug(toSlug(city))
                            .description("KhĂ¡m phĂ¡ " + city + " cĂ¹ng cĂ¡c homestay Ä‘ang cĂ³ trĂªn Cozygo")
                            .thumbnailUrl(defaultThumbnail(rs.getString("thumbnail_url"), city))
                            .displayOrder(rowNum + 1)
                            .homestayCount(rs.getLong("homestay_count"))
                            .build();
                }
        );
    }
    public PublicHomestayResponse toResponse(Homestay homestay) {
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
        String city = firstNonBlank(homestay.getCity(), homestay.getProvince());
        String province = firstNonBlank(homestay.getProvince(), city);
        String mainImage = images.isEmpty() ? defaultThumbnail(null, city) : images.get(0).getImageUrl();

        return PublicHomestayResponse.builder()
                .id(homestay.getHomeId())
                .homeId(homestay.getHomeId())
                .code("HMS-" + String.format("%03d", homestay.getHomeId()))
                .name(homestay.getHomeName())
                .homeName(homestay.getHomeName())
                .address(homestay.getHomeAddress())
                .homeAddress(homestay.getHomeAddress())
                .city(city)
                .province(province)
                .latitude(homestay.getLatitude())
                .longitude(homestay.getLongitude())
                .location(homestay.getHomeAddress())
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
                .roomType("Homestay riêng tư tại " + city)
                .details(defaultInt(homestay.getBedroomCount()) + " phòng ngủ • "
                        + defaultInt(homestay.getBathroomCount()) + " phòng tắm • "
                        + defaultInt(homestay.getKitchenCount()) + " bếp • "
                        + defaultInt(homestay.getLivingRoomCount()) + " phòng khách")
                .beds(defaultInt(homestay.getBedCount()) + " giường • phù hợp " + defaultInt(homestay.getMaxGuest()) + " khách")
                .distance(homestay.getHomeAddress())
                .alert(discount.compareTo(BigDecimal.ZERO) > 0 ? "\u0110ang c\u00f3 \u01b0u \u0111\u00e3i " + discount.stripTrailingZeros().toPlainString() + "%" : "C\u00f3 th\u1ec3 \u0111\u1eb7t cho chuy\u1ebfn \u0111i s\u1eafp t\u1edbi")
                .orders(Math.max(0, ratingCount * 3 + homestay.getHomeId()))
                .tax("\u0110\u00e3 bao g\u1ed3m thu\u1ebf v\u00e0 ph\u00ed d\u1ecbch v\u1ee5 c\u01a1 b\u1ea3n")
                .img(mainImage)
                .ownerName(homestay.getOwner() == null ? null : homestay.getOwner().getFullName())
                .createdAt(homestay.getCreatedAt())
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
        if (keyword == null || keyword.isBlank() || keyword.equals(normalize("Táº¥t cáº£ Ä‘á»‹a Ä‘iá»ƒm"))) {
            return true;
        }
        return normalize(item.getName()).contains(keyword)
                || normalize(item.getProvince()).contains(keyword)
                || normalize(item.getCity()).contains(keyword)
                || normalize(item.getAddress()).contains(keyword)
                || normalize(item.getLocation()).contains(keyword);
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
            case "LĂ¢m Äá»“ng" -> "ÄĂ  Láº¡t Má»™ng MÆ¡";
            case "Cáº§n ThÆ¡" -> "Cáº§n ThÆ¡ SĂ´ng NÆ°á»›c";
            case "ÄĂ  Náºµng" -> "ÄĂ  Náºµng Biá»ƒn Xanh";
            case "LĂ o Cai" -> "Sapa TĂ¢y Báº¯c";
            default -> province;
        };
    }

    private String defaultThumbnail(String thumbnail, String province) {
        if (thumbnail != null && !thumbnail.isBlank()) return thumbnail;
        return switch (province == null ? "" : province) {
            case "LĂ¢m Äá»“ng" -> "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=900&auto=format&fit=crop";
            case "Cáº§n ThÆ¡" -> "https://images.unsplash.com/photo-1549693578-d683be217e58?q=80&w=900&auto=format&fit=crop";
            case "ÄĂ  Náºµng" -> "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=900&auto=format&fit=crop";
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

    private String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) return first;
        return second == null ? "" : second;
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






