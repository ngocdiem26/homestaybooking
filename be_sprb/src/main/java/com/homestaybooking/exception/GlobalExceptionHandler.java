package com.homestaybooking.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ItineraryGenerationException.class)
    public ResponseEntity<Map<String, Object>> handleItineraryGenerationException(ItineraryGenerationException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("code", safeText(ex.getCode(), "ITINERARY_GENERATION_FAILED"));
        body.put("message", safeText(
                ex.getReason(),
                "Không thể tạo lịch trình phù hợp. Vui lòng kiểm tra lại thông tin và thử lại."
        ));
        body.put("violations", ex.getViolations() == null ? List.of() : ex.getViolations());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException ex) {
        ErrorResponse response = ErrorResponse.builder()
                .message(safeText(ex.getMessage(), "Yêu cầu không hợp lệ."))
                .status(HttpStatus.BAD_REQUEST.value())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDataAccessException(DataAccessException ex) {
        log.error("Database exception", ex);
        Throwable cause = ex.getMostSpecificCause();
        String detail = cause == null ? null : cause.getMessage();
        ErrorResponse response = ErrorResponse.builder()
                .message("Không lưu hoặc đọc được dữ liệu. Vui lòng kiểm tra schema database. " + safeText(detail, ""))
                .status(HttpStatus.BAD_REQUEST.value())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.badRequest().body(response);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex) {
        log.error("Unhandled exception", ex);
        ErrorResponse response = ErrorResponse.builder()
                .message("Lỗi hệ thống khi xử lý yêu cầu. Vui lòng thử lại hoặc kiểm tra log backend.")
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private String safeText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}