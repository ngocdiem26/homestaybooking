package com.homestaybooking.service;

import com.homestaybooking.dto.request.SearchHistoryRequest;
import com.homestaybooking.dto.response.SearchHistoryResponse;
import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchHistoryService {
    private static final int MAX_HISTORY_ITEMS = 8;

    private final JdbcTemplate jdbcTemplate;
    private final RevenueAccessService revenueAccessService;

    public List<SearchHistoryResponse> getMySearchHistory(String authorizationHeader) {
        User user = revenueAccessService.requireUser(authorizationHeader);
        return getHistory(user.getUserId());
    }

    @Transactional
    public List<SearchHistoryResponse> saveMySearchHistory(String authorizationHeader, SearchHistoryRequest request) {
        User user = revenueAccessService.requireUser(authorizationHeader);
        String keyword = normalizeKeyword(request == null ? null : request.getKeyword());

        jdbcTemplate.update(
                "DELETE FROM search_histories WHERE user_id = ? AND LOWER(keyword) = LOWER(?)",
                user.getUserId(),
                keyword
        );
        jdbcTemplate.update(
                "INSERT INTO search_histories (user_id, keyword, search_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
                user.getUserId(),
                keyword
        );
        trimOldHistory(user.getUserId());

        return getHistory(user.getUserId());
    }

    @Transactional
    public List<SearchHistoryResponse> removeMySearchHistory(String authorizationHeader, Integer searchId) {
        User user = revenueAccessService.requireUser(authorizationHeader);
        jdbcTemplate.update(
                "DELETE FROM search_histories WHERE user_id = ? AND search_id = ?",
                user.getUserId(),
                searchId
        );
        return getHistory(user.getUserId());
    }

    @Transactional
    public List<SearchHistoryResponse> removeMySearchHistoryByKeyword(String authorizationHeader, String keyword) {
        User user = revenueAccessService.requireUser(authorizationHeader);
        String normalizedKeyword = normalizeKeyword(keyword);
        jdbcTemplate.update(
                "DELETE FROM search_histories WHERE user_id = ? AND LOWER(keyword) = LOWER(?)",
                user.getUserId(),
                normalizedKeyword
        );
        return getHistory(user.getUserId());
    }

    @Transactional
    public List<SearchHistoryResponse> clearMySearchHistory(String authorizationHeader) {
        User user = revenueAccessService.requireUser(authorizationHeader);
        jdbcTemplate.update("DELETE FROM search_histories WHERE user_id = ?", user.getUserId());
        return List.of();
    }

    private List<SearchHistoryResponse> getHistory(Integer userId) {
        String sql = """
                SELECT search_id, keyword, search_at
                FROM search_histories
                WHERE user_id = ?
                ORDER BY search_at DESC, search_id DESC
                LIMIT ?
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> SearchHistoryResponse.builder()
                .searchId(rs.getInt("search_id"))
                .keyword(rs.getString("keyword"))
                .searchAt(toLocalDateTime(rs.getTimestamp("search_at")))
                .build(), userId, MAX_HISTORY_ITEMS);
    }

    private void trimOldHistory(Integer userId) {
        String sql = """
                DELETE FROM search_histories
                WHERE user_id = ?
                  AND search_id NOT IN (
                      SELECT search_id
                      FROM (
                          SELECT search_id
                          FROM search_histories
                          WHERE user_id = ?
                          ORDER BY search_at DESC, search_id DESC
                          LIMIT ?
                      ) kept_search_histories
                  )
                """;
        jdbcTemplate.update(sql, userId, userId, MAX_HISTORY_ITEMS);
    }

    private String normalizeKeyword(String keyword) {
        String normalized = keyword == null ? "" : keyword.trim().replaceAll("\\s+", " ");
        if (normalized.isBlank()) {
            throw new AppException("Vui lòng nhập điểm đến cần tìm kiếm");
        }
        if (normalized.length() > 255) {
            return normalized.substring(0, 255);
        }
        return normalized;
    }

    private LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }
}
