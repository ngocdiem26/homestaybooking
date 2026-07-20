package com.homestaybooking.service;

import com.homestaybooking.dto.request.HostHomestayImageRequest;
import com.homestaybooking.dto.request.HostHomestayRequest;
import com.homestaybooking.dto.request.HostHomestayServiceRequest;
import com.homestaybooking.dto.response.HostHomestayImageResponse;
import com.homestaybooking.dto.response.HostHomestayResponse;
import com.homestaybooking.dto.response.HostHomestayServiceResponse;
import com.homestaybooking.entity.Homestay;
import com.homestaybooking.entity.HomestayImage;
import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.HomestayImageRepository;
import com.homestaybooking.repository.HomestayRepository;
import com.homestaybooking.repository.UserRepository;
import com.homestaybooking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HostHomestayService {

    private static final String DEFAULT_STATUS = "PENDING";

    private final HomestayRepository homestayRepository;
    private final HomestayImageRepository homestayImageRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public List<HostHomestayResponse> getHomestays(Integer ownerId, String authorizationHeader) {
        User owner = resolveOwner(ownerId, authorizationHeader);

        return homestayRepository.findByOwnerUserIdAndDeletedAtIsNull(owner.getUserId()).stream()
                .sorted(Comparator.comparing(Homestay::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public HostHomestayResponse createHomestay(HostHomestayRequest request, String authorizationHeader) {
        User owner = resolveOwner(request.getOwnerId(), authorizationHeader);
        Homestay homestay = new Homestay();
        homestay.setOwner(owner);
        homestay.setStatus(DEFAULT_STATUS);
        homestay.setRatingAvg(BigDecimal.ZERO);
        homestay.setRatingCount(0);
        applyFields(homestay, request);

        Homestay saved = homestayRepository.save(homestay);
        syncRelations(saved, request);
        return toResponse(refresh(saved.getHomeId(), owner.getUserId()));
    }

    @Transactional
    public HostHomestayResponse updateHomestay(Integer homeId, HostHomestayRequest request, String authorizationHeader) {
        User owner = resolveOwner(request.getOwnerId(), authorizationHeader);
        Homestay homestay = getOwnedHomestay(homeId, owner.getUserId());
        applyFields(homestay, request);
        homestay.setUpdatedAt(LocalDateTime.now());

        Homestay saved = homestayRepository.save(homestay);
        syncRelations(saved, request);
        return toResponse(refresh(saved.getHomeId(), owner.getUserId()));
    }

    @Transactional
    public void deleteHomestay(Integer homeId, Integer ownerId, String authorizationHeader) {
        User owner = resolveOwner(ownerId, authorizationHeader);
        Homestay homestay = getOwnedHomestay(homeId, owner.getUserId());
        homestay.setDeletedAt(LocalDateTime.now());
        homestayRepository.save(homestay);
    }

    public HostHomestayImageResponse uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException("Vui lòng chọn ảnh homestay");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException("File tải lên phải là ảnh");
        }

        try {
            Path uploadDirectory = Paths.get("uploads", "homestays").toAbsolutePath().normalize();
            Files.createDirectories(uploadDirectory);

            String extension = getFileExtension(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + extension;
            Path target = uploadDirectory.resolve(fileName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return HostHomestayImageResponse.builder()
                    .imageUrl("/uploads/homestays/" + fileName)
                    .isMain(false)
                    .build();
        } catch (IOException exception) {
            throw new AppException("Không tải được ảnh homestay");
        }
    }

    private Homestay refresh(Integer homeId, Integer ownerId) {
        return homestayRepository.findByHomeIdAndOwnerUserIdAndDeletedAtIsNull(homeId, ownerId)
                .orElseThrow(() -> new AppException("Không tìm thấy homestay"));
    }

    private Homestay getOwnedHomestay(Integer homeId, Integer ownerId) {
        return homestayRepository.findByHomeIdAndOwnerUserIdAndDeletedAtIsNull(homeId, ownerId)
                .orElseThrow(() -> new AppException("Không tìm thấy homestay thuộc tài khoản host này"));
    }

    private User resolveOwner(Integer ownerId, String authorizationHeader) {
        String email = jwtUtil.extractEmailFromAuthorizationHeader(authorizationHeader);
        if (email != null) {
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException("Không tìm thấy tài khoản host"));
        }

        if (ownerId != null) {
            return userRepository.findById(ownerId)
                    .orElseThrow(() -> new AppException("Không tìm thấy tài khoản host"));
        }

        throw new AppException("Thiếu thông tin tài khoản host");
    }

    private void applyFields(Homestay homestay, HostHomestayRequest request) {
        if (isBlank(request.getHomeName())) throw new AppException("Tên homestay không được để trống");
        if (isBlank(request.getHomeAddress())) throw new AppException("Địa chỉ homestay không được để trống");
        if (isBlank(request.getCity())) throw new AppException("Thành phố không được để trống");
        if (isBlank(request.getProvince())) throw new AppException("Không xác định được tỉnh tương ứng với thành phố đã chọn");

        homestay.setHomeName(request.getHomeName().trim());
        homestay.setHomeAddress(request.getHomeAddress().trim());
        homestay.setProvince(request.getProvince().trim());
        homestay.setCity(request.getCity().trim());
        homestay.setLatitude(request.getLatitude());
        homestay.setLongitude(request.getLongitude());
        homestay.setHomeDescription(request.getHomeDescription());
        homestay.setPricePerNight(defaultMoney(request.getPricePerNight()));
        homestay.setDiscountPercent(defaultMoney(request.getDiscountPercent()));
        homestay.setMaxGuest(defaultInt(request.getMaxGuest(), 1));
        homestay.setBedroomCount(defaultInt(request.getBedroomCount(), 1));
        homestay.setBathroomCount(defaultInt(request.getBathroomCount(), 1));
        homestay.setKitchenCount(defaultInt(request.getKitchenCount(), 0));
        homestay.setLivingRoomCount(defaultInt(request.getLivingRoomCount(), 0));
        homestay.setBedCount(defaultInt(request.getBedCount(), 1));
        homestay.setCheckinTime(defaultTime(request.getCheckinTime(), LocalTime.of(14, 0)));
        homestay.setCheckoutTime(defaultTime(request.getCheckoutTime(), LocalTime.of(12, 0)));
    }

    private void syncRelations(Homestay homestay, HostHomestayRequest request) {
        syncImages(homestay, request.getImages());
        syncAmenities(homestay.getHomeId(), request.getAmenities());
        syncServices(homestay.getHomeId(), request.getServices());
        syncRules(homestay.getHomeId(), request.getRules());
    }

    private void syncImages(Homestay homestay, List<HostHomestayImageRequest> images) {
        homestayImageRepository.deleteByHomestayHomeId(homestay.getHomeId());
        if (images == null || images.isEmpty()) return;

        List<HostHomestayImageRequest> validImages = images.stream()
                .filter(image -> image != null && !isBlank(image.getImageUrl()))
                .toList();

        int mainIndex = 0;
        for (int i = 0; i < validImages.size(); i++) {
            if (Boolean.TRUE.equals(validImages.get(i).getIsMain())) {
                mainIndex = i;
                break;
            }
        }

        for (int i = 0; i < validImages.size(); i++) {
            HostHomestayImageRequest image = validImages.get(i);
            homestayImageRepository.save(HomestayImage.builder()
                    .homestay(homestay)
                    .imageUrl(image.getImageUrl().trim())
                    .isMain(i == mainIndex)
                    .sortOrder(image.getSortOrder() != null ? image.getSortOrder() : i + 1)
                    .build());
        }
    }

    private void syncAmenities(Integer homeId, List<String> amenities) {
        jdbcTemplate.update("delete from homestay_amenities where home_id = ?", homeId);
        if (amenities == null) return;

        for (String amenityName : amenities.stream().filter(name -> !isBlank(name)).distinct().toList()) {
            Integer amenityId = findOrCreateAmenity(amenityName.trim());
            jdbcTemplate.update(
                    "insert into homestay_amenities (amenity_id, home_id, created_at) values (?, ?, ?)",
                    amenityId,
                    homeId,
                    Timestamp.valueOf(LocalDateTime.now())
            );
        }
    }

    private void syncServices(Integer homeId, List<HostHomestayServiceRequest> services) {
        if (services == null) return;

        List<Integer> keptServiceIds = new ArrayList<>();
        for (HostHomestayServiceRequest service : services) {
            if (service == null || isBlank(service.getServiceName())) continue;

            Integer serviceId = service.getServiceId() != null
                    ? service.getServiceId()
                    : findOrCreateService(service.getServiceName().trim(), service.getDescription());
            Integer homestayServiceId = resolveHomestayServiceId(homeId, service.getHomestayServiceId(), serviceId);

            if (homestayServiceId != null) {
                jdbcTemplate.update(
                        "update homestay_services set service_id = ?, price = ?, status = ? where homestay_service_id = ? and home_id = ?",
                        serviceId,
                        defaultMoney(service.getPrice()),
                        normalizeServiceStatus(service.getStatus()),
                        homestayServiceId,
                        homeId
                );
                addUnique(keptServiceIds, homestayServiceId);
                continue;
            }

            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement statement = connection.prepareStatement(
                        "insert into homestay_services (service_id, home_id, price, status, created_at) values (?, ?, ?, ?, ?)",
                        Statement.RETURN_GENERATED_KEYS
                );
                statement.setInt(1, serviceId);
                statement.setInt(2, homeId);
                statement.setBigDecimal(3, defaultMoney(service.getPrice()));
                statement.setString(4, normalizeServiceStatus(service.getStatus()));
                statement.setTimestamp(5, Timestamp.valueOf(LocalDateTime.now()));
                return statement;
            }, keyHolder);

            Number key = keyHolder.getKey();
            if (key != null) {
                addUnique(keptServiceIds, key.intValue());
            }
        }

        archiveRemovedServices(homeId, keptServiceIds);
    }

    private void syncRules(Integer homeId, List<String> rules) {
        jdbcTemplate.update("delete from rules where home_id = ?", homeId);
        if (rules == null) return;

        for (String rule : rules.stream().filter(item -> !isBlank(item)).distinct().toList()) {
            jdbcTemplate.update(
                    "insert into rules (home_id, rule_content, created_at) values (?, ?, ?)",
                    homeId,
                    rule.trim(),
                    Timestamp.valueOf(LocalDateTime.now())
            );
        }
    }

    private Integer findOrCreateAmenity(String amenityName) {
        try {
            return jdbcTemplate.queryForObject(
                    "select amenity_id from amenities where lower(amenity_name) = lower(?) limit 1",
                    Integer.class,
                    amenityName
            );
        } catch (EmptyResultDataAccessException ignored) {
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement statement = connection.prepareStatement(
                        "insert into amenities (amenity_name, description_amenity) values (?, ?)",
                        Statement.RETURN_GENERATED_KEYS
                );
                statement.setString(1, amenityName);
                statement.setString(2, amenityName);
                return statement;
            }, keyHolder);
            Number key = keyHolder.getKey();
            if (key == null) throw new AppException("Không tạo được tiện nghi");
            return key.intValue();
        }
    }

    private Integer findOrCreateService(String serviceName, String description) {
        try {
            return jdbcTemplate.queryForObject(
                    "select service_id from services where lower(service_name) = lower(?) limit 1",
                    Integer.class,
                    serviceName
            );
        } catch (EmptyResultDataAccessException ignored) {
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement statement = connection.prepareStatement(
                        "insert into services (service_name, description) values (?, ?)",
                        Statement.RETURN_GENERATED_KEYS
                );
                statement.setString(1, serviceName);
                statement.setString(2, description == null ? serviceName : description);
                return statement;
            }, keyHolder);
            Number key = keyHolder.getKey();
            if (key == null) throw new AppException("Không tạo được dịch vụ");
            return key.intValue();
        }
    }

    private Integer resolveHomestayServiceId(Integer homeId, Integer homestayServiceId, Integer serviceId) {
        if (homestayServiceId != null) {
            try {
                return jdbcTemplate.queryForObject(
                        "select homestay_service_id from homestay_services where home_id = ? and homestay_service_id = ? limit 1",
                        Integer.class,
                        homeId,
                        homestayServiceId
                );
            } catch (EmptyResultDataAccessException ignored) {
                // Continue by matching the catalog service for this homestay.
            }
        }

        try {
            return jdbcTemplate.queryForObject(
                    "select homestay_service_id from homestay_services where home_id = ? and service_id = ? limit 1",
                    Integer.class,
                    homeId,
                    serviceId
            );
        } catch (EmptyResultDataAccessException ignored) {
            return null;
        }
    }

    private void archiveRemovedServices(Integer homeId, List<Integer> keptServiceIds) {
        String keptClause = "";
        Object[] keptParams = new Object[]{homeId};

        if (!keptServiceIds.isEmpty()) {
            String placeholders = keptServiceIds.stream().map(id -> "?").collect(Collectors.joining(", "));
            keptClause = " and homestay_service_id not in (" + placeholders + ")";
            List<Object> params = new ArrayList<>();
            params.add(homeId);
            params.addAll(keptServiceIds);
            keptParams = params.toArray();
        }

        jdbcTemplate.update(
                "delete from homestay_services "
                        + "where home_id = ?"
                        + keptClause
                        + " and homestay_service_id not in ("
                        + "select distinct bs.homestay_service_id from booking_services bs where bs.homestay_service_id is not null"
                        + ")",
                keptParams
        );

        jdbcTemplate.update(
                "update homestay_services set status = 'BLOCKED' "
                        + "where home_id = ?"
                        + keptClause
                        + " and homestay_service_id in ("
                        + "select distinct bs.homestay_service_id from booking_services bs where bs.homestay_service_id is not null"
                        + ")",
                keptParams
        );
    }

    private void addUnique(List<Integer> values, Integer value) {
        if (value != null && !values.contains(value)) {
            values.add(value);
        }
    }

    private HostHomestayResponse toResponse(Homestay homestay) {
        return HostHomestayResponse.builder()
                .homeId(homestay.getHomeId())
                .ownerId(homestay.getOwner().getUserId())
                .ownerName(homestay.getOwner().getFullName())
                .homeName(homestay.getHomeName())
                .homeAddress(homestay.getHomeAddress())
                .province(homestay.getProvince())
                .city(homestay.getCity())
                .latitude(homestay.getLatitude())
                .longitude(homestay.getLongitude())
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
                .createdAt(homestay.getCreatedAt())
                .updatedAt(homestay.getUpdatedAt())
                .images(toImageResponses(homestay.getHomeId()))
                .amenities(getAmenityNames(homestay.getHomeId()))
                .services(getServiceResponses(homestay.getHomeId()))
                .rules(getRules(homestay.getHomeId()))
                .build();
    }

    private List<HostHomestayImageResponse> toImageResponses(Integer homeId) {
        return homestayImageRepository.findByHomestayHomeIdOrderByIsMainDescSortOrderAscImageIdAsc(homeId).stream()
                .map(image -> HostHomestayImageResponse.builder()
                        .imageId(image.getImageId())
                        .imageUrl(image.getImageUrl())
                        .isMain(image.getIsMain())
                        .sortOrder(image.getSortOrder())
                        .build())
                .toList();
    }

    private List<String> getAmenityNames(Integer homeId) {
        return jdbcTemplate.query(
                "select a.amenity_name from homestay_amenities ha join amenities a on a.amenity_id = ha.amenity_id where ha.home_id = ? order by a.amenity_name",
                (rs, rowNum) -> rs.getString("amenity_name"),
                homeId
        );
    }

    private List<HostHomestayServiceResponse> getServiceResponses(Integer homeId) {
        return jdbcTemplate.query(
                "select hs.homestay_service_id, s.service_id, s.service_name, s.description, hs.price, hs.status from homestay_services hs join services s on s.service_id = hs.service_id where hs.home_id = ? order by s.service_name",
                (rs, rowNum) -> HostHomestayServiceResponse.builder()
                        .homestayServiceId(rs.getInt("homestay_service_id"))
                        .serviceId(rs.getInt("service_id"))
                        .serviceName(rs.getString("service_name"))
                        .description(rs.getString("description"))
                        .price(rs.getBigDecimal("price"))
                        .status(rs.getString("status"))
                        .build(),
                homeId
        );
    }

    private List<String> getRules(Integer homeId) {
        return jdbcTemplate.query(
                "select rule_content from rules where home_id = ? order by rule_id",
                (rs, rowNum) -> rs.getString("rule_content"),
                homeId
        );
    }

    private String getFileExtension(String originalFileName) {
        if (originalFileName == null || !originalFileName.contains(".")) {
            return ".jpg";
        }
        String extension = originalFileName.substring(originalFileName.lastIndexOf('.')).toLowerCase();
        if (List.of(".jpg", ".jpeg", ".png", ".webp", ".gif").contains(extension)) {
            return extension;
        }
        return ".jpg";
    }

    private String normalizeServiceStatus(String status) {
        if (isBlank(status)) return "APPROVED";
        String normalized = status.trim().toUpperCase();
        if (List.of("PENDING", "APPROVED", "REJECTED", "BLOCKED").contains(normalized)) return normalized;
        if (status.contains("ngưng") || status.contains("Ngưng")) return "BLOCKED";
        return "APPROVED";
    }

    private BigDecimal defaultMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private Integer defaultInt(Integer value, int fallback) {
        return value == null ? fallback : Math.max(value, 0);
    }

    private LocalTime defaultTime(LocalTime value, LocalTime fallback) {
        return Objects.requireNonNullElse(value, fallback);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
