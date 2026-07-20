package com.homestaybooking.service;

import org.springframework.stereotype.Service;

@Service
public class IntentDetectionService {

    public String detectIntent(String message) {
        String text = normalize(message);

        if (containsAny(text,
                "tim homestay", "tim phong", "homestay o", "phong o",
                "gia duoi", "cho may nguoi", "di da lat", "o dau")) {
            return "SEARCH_HOMESTAY";
        }

        if (containsAny(text, "khuyen mai", "ma giam gia", "voucher", "promotion", "uu dai")) {
            return "PROMOTION_LOOKUP";
        }

        if (containsAny(text, "dia diem", "kham pha", "du lich", "di dau", "noi nao dep")) {
            return "DESTINATION_SUGGESTION";
        }

        if (containsAny(text, "hoat dong", "trai nghiem", "tour", "choi gi", "san may", "cho noi")) {
            return "ACTIVITY_SUGGESTION";
        }

        if (containsAny(text, "booking cua toi", "don dat phong", "trang thai dat phong", "da thanh toan chua")) {
            return "BOOKING_STATUS";
        }

        if (containsAny(text, "sepay", "thanh toan online", "chuyen khoan", "qr")) {
            return "SEPAY_GUIDE";
        }

        if (containsAny(text, "thanh toan tai cho", "tra tien tai cho", "tra tai homestay")) {
            return "PAY_AT_PROPERTY_GUIDE";
        }

        if (containsAny(text, "dat phong", "booking", "cach dat", "dat homestay")) {
            return "BOOKING_GUIDE";
        }

        if (containsAny(text, "khieu nai", "bao cao", "tranh chap", "lua dao", "chu homestay")) {
            return "COMPLAINT_GUIDE";
        }

        return "RAG_GENERAL";
    }

    public String normalize(String input) {
        if (input == null) return "";
        String text = input.toLowerCase();
        text = text.replace("đ", "d");
        text = text.replaceAll("[áàảãạăắằẳẵặâấầẩẫậ]", "a");
        text = text.replaceAll("[éèẻẽẹêếềểễệ]", "e");
        text = text.replaceAll("[íìỉĩị]", "i");
        text = text.replaceAll("[óòỏõọôốồổỗộơớờởỡợ]", "o");
        text = text.replaceAll("[úùủũụưứừửữự]", "u");
        text = text.replaceAll("[ýỳỷỹỵ]", "y");
        return text;
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) return true;
        }
        return false;
    }
}