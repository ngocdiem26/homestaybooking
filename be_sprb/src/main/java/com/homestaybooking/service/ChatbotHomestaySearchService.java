package com.homestaybooking.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service

public class ChatbotHomestaySearchService {

    private String extractProvince(String message) {
        String text = normalize(message);

        if (text.contains("da lat") || text.contains("lam dong")) return "\u0110\u00e0 L\u1ea1t";
        if (text.contains("can tho")) return "C\u1ea7n Th\u01a1";
        if (text.contains("da nang")) return "\u0110\u00e0 N\u1eb5ng";
        if (text.contains("hoi an") || text.contains("quang nam")) return "Qu\u1ea3ng Nam";
        if (text.contains("ha noi")) return "H\u00e0 N\u1ed9i";
        if (text.contains("nha trang") || text.contains("khanh hoa")) return "Kh\u00e1nh H\u00f2a";
        if (text.contains("phu quoc") || text.contains("kien giang")) return "Ki\u00ean Giang";
        if (text.contains("hue") || text.contains("thua thien hue")) return "Th\u1eeba Thi\u00ean Hu\u1ebf";
        if (text.contains("ha giang")) return "H\u00e0 Giang";
        if (text.contains("ha long") || text.contains("quang ninh")) return "Qu\u1ea3ng Ninh";
        if (text.contains("vung tau")) return "B\u00e0 R\u1ecba - V\u0169ng T\u00e0u";

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
        return Normalizer.normalize(input.toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace((char) 273, 'd');
    }

}