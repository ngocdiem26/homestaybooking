package com.homestaybooking.service;

import com.homestaybooking.dto.response.PublicHomestayResponse;
import com.homestaybooking.entity.Homestay;
import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.HomestayRepository;
import com.homestaybooking.repository.UserRepository;
import com.homestaybooking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private static final List<String> HIDDEN_STATUSES = List.of("REJECTED", "BLOCKED", "DELETED");

    private final JdbcTemplate jdbcTemplate;
    private final HomestayRepository homestayRepository;
    private final PublicHomestayService publicHomestayService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public List<PublicHomestayResponse> getFavorites(String authorizationHeader) {
        Integer userId = getCurrentUser(authorizationHeader).getUserId();
        List<Integer> homeIds = jdbcTemplate.queryForList(
                "select home_id from favorites where user_id = ? order by created_at desc, favorite_id desc",
                Integer.class,
                userId
        );
        return mapHomestaysInOrder(homeIds);
    }

    public List<Integer> getFavoriteIds(String authorizationHeader) {
        Integer userId = getCurrentUser(authorizationHeader).getUserId();
        return jdbcTemplate.queryForList(
                "select home_id from favorites where user_id = ? order by created_at desc, favorite_id desc",
                Integer.class,
                userId
        );
    }

    public List<PublicHomestayResponse> getRecommendations(String authorizationHeader) {
        Integer userId = getCurrentUser(authorizationHeader).getUserId();
        boolean hasFavorites = Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                "select count(*) > 0 from favorites where user_id = ?",
                Boolean.class,
                userId
        ));

        List<Integer> homeIds = hasFavorites ? findRecommendedHomeIds(userId) : findPopularHomeIds(userId);
        return mapHomestaysInOrder(homeIds).stream().limit(8).toList();
    }

    public List<Integer> addFavorite(Integer homeId, String authorizationHeader) {
        User user = getCurrentUser(authorizationHeader);
        Homestay homestay = homestayRepository.findByHomeIdAndDeletedAtIsNull(homeId)
                .filter(this::isVisiblePublicly)
                .orElseThrow(() -> new AppException("Homestay not found"));
        try {
            jdbcTemplate.update(
                    "insert into favorites (user_id, home_id) values (?, ?)",
                    user.getUserId(),
                    homestay.getHomeId()
            );
        } catch (DuplicateKeyException ignored) {
            // Already favorited, keep the current row.
        }
        return getFavoriteIds(authorizationHeader);
    }

    public List<Integer> removeFavorite(Integer homeId, String authorizationHeader) {
        Integer userId = getCurrentUser(authorizationHeader).getUserId();
        jdbcTemplate.update("delete from favorites where user_id = ? and home_id = ?", userId, homeId);
        return getFavoriteIds(authorizationHeader);
    }

    private List<Integer> findRecommendedHomeIds(Integer userId) {
        String sql = """
                select h.home_id
                from homestays h
                left join (
                    select distinct fh.user_id as owner_id
                    from favorites f
                    join homestays fh on fh.home_id = f.home_id
                    where f.user_id = ?
                ) favorite_owners on favorite_owners.owner_id = h.user_id
                left join (
                    select distinct coalesce(nullif(fh.city, ''), fh.province) as city, fh.province
                    from favorites f
                    join homestays fh on fh.home_id = f.home_id
                    where f.user_id = ?
                ) favorite_areas on favorite_areas.city = coalesce(nullif(h.city, ''), h.province)
                    or favorite_areas.province = h.province
                where h.deleted_at is null
                  and upper(coalesce(h.status, '')) not in ('REJECTED','BLOCKED','DELETED')
                  and h.home_id not in (select home_id from favorites where user_id = ?)
                order by
                    case
                        when favorite_owners.owner_id is not null then 0
                        when favorite_areas.city is not null or favorite_areas.province is not null then 1
                        else 2
                    end,
                    coalesce(h.rating_avg, 0) desc,
                    coalesce(h.rating_count, 0) desc,
                    h.home_id desc
                limit 8
                """;
        return jdbcTemplate.queryForList(sql, Integer.class, userId, userId, userId);
    }

    private List<Integer> findPopularHomeIds(Integer userId) {
        String sql = """
                select h.home_id
                from homestays h
                where h.deleted_at is null
                  and upper(coalesce(h.status, '')) not in ('REJECTED','BLOCKED','DELETED')
                  and h.home_id not in (select home_id from favorites where user_id = ?)
                order by coalesce(h.rating_avg, 0) desc, coalesce(h.rating_count, 0) desc, h.home_id desc
                limit 8
                """;
        return jdbcTemplate.queryForList(sql, Integer.class, userId);
    }

    private List<PublicHomestayResponse> mapHomestaysInOrder(List<Integer> homeIds) {
        if (homeIds == null || homeIds.isEmpty()) return List.of();
        Map<Integer, Homestay> homestaysById = homestayRepository.findVisibleCardsByHomeIdIn(homeIds).stream()
                .filter(this::isVisiblePublicly)
                .collect(Collectors.toMap(Homestay::getHomeId, Function.identity(), (left, right) -> left));

        List<PublicHomestayResponse> responses = new ArrayList<>();
        for (Integer homeId : homeIds) {
            Homestay homestay = homestaysById.get(homeId);
            if (homestay != null) {
                responses.add(publicHomestayService.toResponse(homestay));
            }
        }
        return responses;
    }

    private boolean isVisiblePublicly(Homestay homestay) {
        String status = homestay.getStatus() == null ? "" : homestay.getStatus().toUpperCase(Locale.ROOT);
        return !HIDDEN_STATUSES.contains(status);
    }

    private User getCurrentUser(String authorizationHeader) {
        String email = jwtUtil.extractEmailFromAuthorizationHeader(authorizationHeader);
        if (email == null) throw new AppException("Login is required");
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Current user not found"));
    }
}
