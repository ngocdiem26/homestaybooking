package com.homestaybooking.service;

import com.homestaybooking.config.VnpayProperties;
import com.homestaybooking.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VnpayService {

    private static final ZoneId VNPAY_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter VNPAY_DATE_TIME_FORMAT =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss");


    private static final String DEFAULT_FRONTEND_RESULT_URL = "http://localhost:5173/payment/result";
    private static final String DEFAULT_FRONTEND_BASE_URL = "http://localhost:5173";

    private final VnpayProperties properties;

    public String createPaymentUrl(
            Long paymentId,
            BigDecimal amount,
            String orderInfo,
            String clientIp
    ) {
        validateConfig();

        ZonedDateTime now = ZonedDateTime.now(VNPAY_ZONE);
        String createDate = now.format(VNPAY_DATE_TIME_FORMAT);
        String expireDate = now.plusMinutes(15).format(VNPAY_DATE_TIME_FORMAT);

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", trim(properties.getTmnCode()));
        params.put("vnp_Amount", toVnpayAmount(amount));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", String.valueOf(paymentId));
        params.put("vnp_OrderInfo", normalizeOrderInfo(orderInfo, paymentId));
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", trim(properties.getReturnUrl()));
        params.put("vnp_IpAddr", normalizeClientIp(clientIp));
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        String hashData = buildHashData(params);
        String secureHash = hmacSha512(trim(properties.getHashSecret()), hashData);
        return trim(properties.getPayUrl()) + "?" + hashData + "&vnp_SecureHash=" + secureHash;
    }

    public boolean verifySignature(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isBlank()) {
            return false;
        }

        Map<String, String> cleanParams = new HashMap<>(params);
        cleanParams.remove("vnp_SecureHash");
        cleanParams.remove("vnp_SecureHashType");

        String hashData = buildHashData(cleanParams);
        String calculatedHash = hmacSha512(trim(properties.getHashSecret()), hashData);
        return calculatedHash.equalsIgnoreCase(receivedHash);
    }

    public String frontendResultUrl(String status, String bookingId, String bookingCode, String message) {
        Map<String, String> params = new HashMap<>();
        params.put("status", status);
        params.put("bookingId", bookingId);
        params.put("bookingCode", bookingCode);
        params.put("message", message);
        return trimOrDefault(properties.getFrontendResultUrl(), DEFAULT_FRONTEND_RESULT_URL) + "?" + buildHashData(params);
    }


    public String frontendCheckoutResultUrl(
            String status,
            Integer homeId,
            String bookingId,
            String bookingCode,
            String bookingStatus,
            String paymentStatus,
            String message
    ) {
        if (homeId == null) {
            return frontendResultUrl(status, bookingId, bookingCode, message);
        }

        Map<String, String> params = new HashMap<>();
        params.put("checkout", "vnpay-result");
        params.put("status", status);
        params.put("bookingId", bookingId);
        params.put("bookingCode", bookingCode);
        params.put("bookingStatus", bookingStatus);
        params.put("paymentStatus", paymentStatus);
        params.put("message", message);
        return frontendBaseUrl() + "/homestay/" + homeId + "?" + buildHashData(params);
    }
    public String buildHashData(Map<String, String> params) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        List<String> pairs = new ArrayList<>();
        for (String fieldName : fieldNames) {
            String fieldValue = params.get(fieldName);
            if (fieldValue != null && !fieldValue.isBlank()) {
                pairs.add(encode(fieldName) + "=" + encode(fieldValue));
            }
        }
        return String.join("&", pairs);
    }

    public String hmacSha512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                hash.append(String.format("%02x", b));
            }
            return hash.toString();
        } catch (Exception exception) {
            throw new IllegalStateException("Không thể tạo chữ ký VNPAY", exception);
        }
    }


    private String frontendBaseUrl() {
        String configured = trimOrDefault(properties.getFrontendResultUrl(), DEFAULT_FRONTEND_RESULT_URL);
        if (configured.endsWith("/payment/result")) {
            return configured.substring(0, configured.length() - "/payment/result".length());
        }
        int schemeIndex = configured.indexOf("://");
        if (schemeIndex > -1) {
            int pathIndex = configured.indexOf('/', schemeIndex + 3);
            if (pathIndex > -1) {
                return configured.substring(0, pathIndex);
            }
            return configured;
        }
        return DEFAULT_FRONTEND_BASE_URL;
    }
    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String normalizeOrderInfo(String orderInfo, Long paymentId) {
        String value = orderInfo == null || orderInfo.isBlank()
                ? "Thanh toan booking Cozygo " + paymentId
                : orderInfo;

        String withoutDiacritics = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return withoutDiacritics
                .replace("#", "")
                .replace(":", "")
                .replace("/", " ")
                .replaceAll("[^A-Za-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String normalizeClientIp(String clientIp) {
        String value = trim(clientIp);
        if (value.isBlank() || "0:0:0:0:0:0:0:1".equals(value) || "::1".equals(value)) {
            return "127.0.0.1";
        }
        return value;
    }

    private void validateConfig() {
        if (trim(properties.getTmnCode()).isBlank()) {
            throw new AppException("Thieu VNPAY_TMN_CODE");
        }
        if (trim(properties.getHashSecret()).isBlank()) {
            throw new AppException("Thieu VNPAY_HASH_SECRET");
        }
        if (trim(properties.getPayUrl()).isBlank()) {
            throw new AppException("Thieu VNPAY_PAY_URL");
        }
        if (trim(properties.getReturnUrl()).isBlank()) {
            throw new AppException("Thieu VNPAY_RETURN_URL");
        }
        if (trim(properties.getTmnCode()).contains("YOUR")) {
            throw new AppException("VNPAY_TMN_CODE van dang la gia tri mau");
        }
        if (trim(properties.getHashSecret()).contains("YOUR")) {
            throw new AppException("VNPAY_HASH_SECRET van dang la gia tri mau");
        }
    }

    private String toVnpayAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException("Số tiền thanh toán VNPAY không hợp lệ");
        }
        return amount.multiply(BigDecimal.valueOf(100)).toBigInteger().toString();
    }

    private String trimOrDefault(String value, String defaultValue) {
        String trimmed = trim(value);
        return trimmed.isBlank() ? defaultValue : trimmed;
    }

    private String trim(String value) {
        return value == null ? "" : value.trim();
    }
}