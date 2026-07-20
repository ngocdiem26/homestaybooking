package com.homestaybooking.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ChatbotHomestaySearchService {

    @PersistenceContext
    private EntityManager entityManager;

   

    private String extractProvince(String message) {
        String text = normalize(message);

        if (text.contains("da lat") || text.contains("lam dong")) return "Lâm Đồng";
        if (text.contains("can tho")) return "Cần Thơ";
        if (text.contains("da nang")) return "Đà Nẵng";
        if (text.contains("hoi an") || text.contains("quang nam")) return "Quảng Nam";
        if (text.contains("ha noi")) return "Hà Nội";
        if (text.contains("nha trang") || text.contains("khanh hoa")) return "Khánh Hòa";
        if (text.contains("phu quoc") || text.contains("kien giang")) return "Kiên Giang";
        if (text.contains("hue") || text.contains("thua thien hue")) return "Thừa Thiên Huế";
        if (text.contains("ha giang")) return "Hà Giang";
        if (text.contains("ha long") || text.contains("quang ninh")) return "Quảng Ninh";

        return null;
    }

    private Integer extractGuests(String message) {
        String text = normalize(message);
        Pattern pattern = Pattern.compile("(\\d+)\\s*(nguoi|khach)");
        Matcher matcher = pattern.matcher(text);

        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }

        return null;
    }

    private BigDecimal extractMaxPrice(String message) {
        String text = normalize(message);

        if (text.contains("duoi 500") || text.contains("duoi 500k")) {
            return new BigDecimal("500000");
        }

        if (text.contains("duoi 1 trieu") || text.contains("duoi 1000000") || text.contains("duoi 1tr")) {
            return new BigDecimal("1000000");
        }

        if (text.contains("duoi 2 trieu") || text.contains("duoi 2000000") || text.contains("duoi 2tr")) {
            return new BigDecimal("2000000");
        }

        if (text.contains("duoi 3 trieu") || text.contains("duoi 3000000") || text.contains("duoi 3tr")) {
            return new BigDecimal("3000000");
        }

        return null;
    }

    private String normalize(String input) {
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
}