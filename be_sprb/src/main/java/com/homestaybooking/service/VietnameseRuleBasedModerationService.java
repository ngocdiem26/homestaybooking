package com.homestaybooking.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestaybooking.dto.response.ReviewModerationResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class VietnameseRuleBasedModerationService {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");

    private static final Pattern VIETNAM_PHONE_PATTERN =
            Pattern.compile("(?<!\\d)(0|84|\\+84)(3|5|7|8|9)\\d{8}(?!\\d)");

    private static final Pattern CCCD_PATTERN =
            Pattern.compile("(?<!\\d)\\d{12}(?!\\d)");

    private static final Pattern MANY_LINKS_PATTERN =
            Pattern.compile("(https?://|www\\.)", Pattern.CASE_INSENSITIVE);

    /*
     * Các pattern dưới đây dùng để bắt teencode/viết tắt có chèn dấu phân cách:
     *   d.m, đ.m, d-c-m, đ c m, d*m*m, v.c.l ...
     *
     * Không dùng pattern kiểu "cac", "lon", "ngu" trên chuỗi đã bỏ dấu,
     * vì dễ gây false positive:
     *   các  -> cac
     *   lớn  -> lon
     *   ngủ  -> ngu
     */
    private static final Pattern STRONG_DM_PATTERN = Pattern.compile(
            "(?iu)(?<![\\p{L}\\p{N}])(?:đ|d)\\s*[._*\\-\\s]*[ck]?\\s*[._*\\-\\s]*m{1,2}(?![\\p{L}\\p{N}])"
    );

    private static final Pattern VCL_PATTERN = Pattern.compile(
            "(?iu)(?<![\\p{L}\\p{N}])v\\s*[._*\\-\\s]*c\\s*[._*\\-\\s]*l(?![\\p{L}\\p{N}])"
    );

    private static final Pattern CMM_PATTERN = Pattern.compile(
            "(?iu)(?<![\\p{L}\\p{N}])c\\s*[._*\\-\\s]*m{2}(?![\\p{L}\\p{N}])"
    );

    private static final Pattern CLM_PATTERN = Pattern.compile(
            "(?iu)(?<![\\p{L}\\p{N}])c\\s*[._*\\-\\s]*l\\s*[._*\\-\\s]*m{1,2}(?![\\p{L}\\p{N}])"
    );

    private final ObjectMapper objectMapper;

    public ReviewModerationResult analyze(String content, Integer rating) {
        String original = content == null ? "" : content;

        /*
         * vietnameseText:
         *   - giữ nguyên dấu tiếng Việt để phân biệt "các/cặc", "lớn/lồn", "ngủ/ngu".
         *
         * accentlessText:
         *   - chỉ dùng cho các rule ít nhập nhằng như threat, spam, privacy,
         *     rating mismatch và sentiment.
         */
        String vietnameseText = normalizeKeepVietnamese(original);
        String accentlessText = normalizeWithoutAccent(original);

        Set<String> categories = new LinkedHashSet<>();

        boolean directThreat = isDirectThreat(accentlessText);
        boolean deathRelated = isDeathRelated(accentlessText);

        boolean profanity = isVietnameseProfanity(original, vietnameseText, accentlessText);
        boolean insult = isVietnameseInsult(vietnameseText, accentlessText);

        boolean hate = isHateSpeechCue(accentlessText);
        boolean spam = isSpam(original, accentlessText);
        boolean privacy = isPrivacyLeak(original, accentlessText);

        boolean sensitivePrivacy =
                containsAny(accentlessText,
                        " cccd ",
                        " cmnd ",
                        " can cuoc ",
                        " so tai khoan ",
                        " stk ")
                        || CCCD_PATTERN.matcher(original).find();

        boolean mismatch = isRatingCommentMismatch(accentlessText, rating);
        String sentiment = sentiment(accentlessText, rating);

        if (directThreat) categories.add("THREAT");
        if (deathRelated) categories.add("DEATH_RELATED");
        if (profanity) categories.add("PROFANITY");
        if (insult) categories.add("INSULT");
        if (hate) categories.add("HATE");
        if (spam) categories.add("SPAM");
        if (privacy) categories.add("PRIVACY");
        if (mismatch) categories.add("RATING_COMMENT_MISMATCH");
        if (categories.isEmpty()) categories.add("SAFE");

        BigDecimal threatScore = score(directThreat, 0.92);
        BigDecimal deathScore = score(deathRelated, directThreat ? 0.78 : 0.55);

        /*
         * Rule-based chỉ là lớp bổ sung.
         * Từ tục/teencode đơn thuần chỉ FLAG_FOR_REVIEW, không tự HIDE.
         */
        BigDecimal profanityScore = score(profanity, 0.52);
        BigDecimal insultScore = score(insult, 0.58);
        BigDecimal hateScore = score(hate, 0.72);
        BigDecimal spamScore = score(spam, 0.50);
        BigDecimal privacyScore = score(privacy, sensitivePrivacy ? 0.88 : 0.48);

        BigDecimal toxicityScore =
                max(profanityScore, insultScore, hateScore, threatScore);

        BigDecimal finalScore =
                max(
                        toxicityScore,
                        profanityScore,
                        insultScore,
                        threatScore,
                        hateScore,
                        deathScore,
                        spamScore,
                        privacyScore
                );

        boolean severe =
                directThreat
                        || threatScore.compareTo(BigDecimal.valueOf(0.70)) >= 0
                        || deathScore.compareTo(BigDecimal.valueOf(0.70)) >= 0
                        || hateScore.compareTo(BigDecimal.valueOf(0.80)) >= 0
                        || privacyScore.compareTo(BigDecimal.valueOf(0.80)) >= 0;

        boolean needsReview =
                severe
                        || finalScore.compareTo(BigDecimal.valueOf(0.40)) >= 0
                        || mismatch;

        return ReviewModerationResult.builder()
                .provider("VIETNAMESE_RULES")
                .modelName("cozygo-rule-vi-v3")
                .moderationStatus(
                        severe
                                ? "RULE_HIDDEN"
                                : needsReview
                                ? "RULE_FLAGGED"
                                : "RULE_SAFE"
                )
                .moderationAction(
                        severe
                                ? "HIDE"
                                : needsReview
                                ? "FLAG_FOR_REVIEW"
                                : "ALLOW"
                )
                .adminReviewStatus(needsReview ? "PENDING" : "NONE")
                .moderationReason(
                        buildReason(categories, severe, needsReview, sentiment)
                )
                .toxicityScore(toxicityScore)
                .profanityScore(profanityScore)
                .insultScore(insultScore)
                .threatScore(threatScore)
                .hateScore(hateScore)
                .deathRelatedScore(deathScore)
                .spamScore(spamScore)
                .privacyScore(privacyScore)
                .finalScore(finalScore)
                .sentiment(sentiment)
                .ratingCommentMismatch(mismatch)
                .categories(toJsonArray(categories))
                .rawResponse(validJsonRaw(categories))
                .severeViolation(severe)
                .needsAdminReview(needsReview)
                .build();
    }

    private boolean isDirectThreat(String text) {
        return containsAny(
                text,
                " tao se giet may ",
                " se giet may ",
                " giet may ",
                " giet chet may ",
                " danh chet may ",
                " dam chet may ",
                " chem chet ",
                " ban chet ",
                " dap chet ",
                " tao se tim may ",
                " se tim may de xu ",
                " cho may chet ",
                " xu may "
        );
    }

    private boolean isDeathRelated(String text) {
        return containsAny(
                text,
                " chet di ",
                " tu tu ",
                " mau me ",
                " dam mau ",
                " giet chet ",
                " danh chet ",
                " dam chet ",
                " chem chet ",
                " ban chet ",
                " xu tu ",
                " hoa thieu "
        );
    }

    /**
     * Phát hiện từ tục/teencode theo hướng HIGH PRECISION.
     *
     * 1) Từ đầy đủ: kiểm tra trên text còn dấu.
     * 2) Viết tắt/teencode: kiểm tra token rõ nghĩa hoặc pattern chèn dấu.
     * 3) Các token rất mơ hồ như cac/lon/ngu KHÔNG được kiểm tra trên text bỏ dấu.
     */
    private boolean isVietnameseProfanity(
            String original,
            String vietnameseText,
            String accentlessText
    ) {
        // Từ đầy đủ có dấu - không tạo lỗi "các/lớn/ngủ".
        boolean explicitWithDiacritics = containsAny(
                vietnameseText,
                " địt ",
                " đụ má ",
                " đụ mẹ ",
                " đéo ",
                " lồn ",
                " cặc ",
                " cứt ",
                " đĩ ",
                " phò ",
                " vãi lồn ",
                " vãi lồng ",
                " đậu má ",
                " đù má ",
                " đù mẹ "
        );

        // Các kiểu viết không dấu/teencode có độ chắc chắn cao.
        boolean strongSlangToken = containsAnyToken(
                accentlessText,
                "dcm",
                "dmm",
                "dkm",
                "cmm",
                "clm",
                "clmm",
                "vcl",
                "loz",
                "dit",
                "duma",
                "dume"
        );

        // Các dạng có dấu còn nguyên token.
        boolean strongVietnameseToken = containsAnyToken(
                vietnameseText,
                "đm",
                "đcm",
                "đmm",
                "đkm"
        );

        // Dạng né kiểm duyệt bằng cách chèn dấu/chèn khoảng trắng.
        boolean obfuscated =
                STRONG_DM_PATTERN.matcher(original).find()
                        || VCL_PATTERN.matcher(original).find()
                        || CMM_PATTERN.matcher(original).find()
                        || CLM_PATTERN.matcher(original).find();

        /*
         * Một số viết tắt trong dữ liệu MXH như "dm", "vl", "cl", "cc", "ml"
         * có thể mang nghĩa khác. Vì vậy không đánh dấu tất cả một cách mù quáng.
         *
         * - "vl": trong review tiếng Việt thường là intensifier tục; chỉ FLAG, không HIDE.
         * - "dm": chỉ bắt khi có ngữ cảnh công kích rõ.
         * - "cl/cc/ml": chỉ bắt khi có ngữ cảnh công kích rõ.
         */
        boolean vulgarIntensifier = containsAnyToken(accentlessText, "vl");

        boolean attackContext = hasAttackContext(vietnameseText, accentlessText);

        boolean ambiguousSlangInAttackContext =
                attackContext
                        && containsAnyToken(
                                accentlessText,
                                "dm",
                                "cl",
                                "cc",
                                "ml"
                        );

        return explicitWithDiacritics
                || strongSlangToken
                || strongVietnameseToken
                || obfuscated
                || vulgarIntensifier
                || ambiguousSlangInAttackContext;
    }

    private boolean isVietnameseInsult(
            String vietnameseText,
            String accentlessText
    ) {
        /*
         * "ngu" được kiểm tra trên text CÒN DẤU.
         * Vì "ngủ" vẫn là "ngủ", không còn bị biến thành "ngu".
         */
        boolean clearInsultWithDiacritics = containsAny(
                vietnameseText,
                " mất dạy ",
                " mất dậy ",
                " óc chó ",
                " ngu ",
                " ngu si ",
                " đần ",
                " đần độn ",
                " dốt ",
                " rác rưởi ",
                " khốn nạn ",
                " vô học ",
                " súc vật ",
                " cặn bã ",
                " rẻ rách ",
                " não tàn ",
                " đồ khốn ",
                " thằng chó ",
                " con chó ",
                " đồ chó ",
                " mặt chó "
        );

        // Biến thể không dấu nhưng phải là cụm đủ rõ nghĩa, không dùng từ đơn mơ hồ.
        boolean clearAccentlessPhrase = containsAny(
                accentlessText,
                " mat day ",
                " mat day doi ",
                " oc cho ",
                " ngu si ",
                " dan don ",
                " rac ruoi ",
                " khon nan ",
                " vo hoc ",
                " suc vat ",
                " can ba ",
                " re rach ",
                " nao tan ",
                " do khon ",
                " thang cho ",
                " con cho ",
                " do cho ",
                " mat cho "
        );

        return clearInsultWithDiacritics || clearAccentlessPhrase;
    }

    private boolean hasAttackContext(
            String vietnameseText,
            String accentlessText
    ) {
        boolean target = containsAnyToken(
                vietnameseText,
                "mày",
                "mi",
                "chủ",
                "admin",
                "ad",
                "thằng",
                "con",
                "ông",
                "bà"
        ) || containsAnyToken(
                accentlessText,
                "may",
                "chu",
                "admin",
                "ad",
                "thang",
                "con",
                "ong",
                "ba"
        );

        boolean aggressive = containsAny(
                vietnameseText,
                " đồ ",
                " mẹ mày ",
                " bố mày ",
                " cút ",
                " biến đi "
        ) || containsAny(
                accentlessText,
                " do ",
                " me may ",
                " bo may ",
                " cut ",
                " bien di "
        );

        return target || aggressive;
    }

    private boolean isHateSpeechCue(String text) {
        return containsAny(
                text,
                " tiet chung ",
                " diet het bon ",
                " giet het bon ",
                " duoi het bon ",
                " bon dan ",
                " lu dan ",
                " ky thi ",
                " thu ghet bon "
        );
    }

    private String buildReason(
            Set<String> categories,
            boolean severe,
            boolean needsReview,
            String sentiment
    ) {
        if (severe && categories.contains("THREAT")) {
            return "Nội dung có dấu hiệu đe dọa nên đánh giá đã bị ẩn tạm thời để admin xem xét.";
        }

        if (severe && categories.contains("PRIVACY")) {
            return "Nội dung có dấu hiệu lộ thông tin riêng tư nhạy cảm nên đánh giá đã bị ẩn tạm thời để admin xem xét.";
        }

        if (severe) {
            return "Nội dung có dấu hiệu vi phạm nghiêm trọng nên đánh giá đã bị ẩn tạm thời để admin xem xét.";
        }

        if (needsReview
                && (categories.contains("PROFANITY")
                || categories.contains("INSULT"))) {
            return "Nội dung có từ ngữ tục, viết tắt nhạy cảm hoặc dấu hiệu xúc phạm nên được chuyển đến admin xem xét, nhưng vẫn hiển thị công khai.";
        }

        if (needsReview && categories.contains("SPAM")) {
            return "Nội dung có dấu hiệu spam hoặc quảng cáo ngoài hệ thống nên cần admin xem xét.";
        }

        if (needsReview && categories.contains("PRIVACY")) {
            return "Nội dung có dấu hiệu chứa thông tin liên hệ hoặc thông tin riêng tư nên cần admin xem xét.";
        }

        if (needsReview
                && categories.contains("RATING_COMMENT_MISMATCH")) {
            return "Điểm sao và nội dung nhận xét chưa đồng nhất nên cần admin xem xét thêm.";
        }

        if ("NEGATIVE".equals(sentiment)) {
            return "Đánh giá tiêu cực nhưng không có dấu hiệu vi phạm nên được hiển thị.";
        }

        return "Không phát hiện nội dung vi phạm bằng bộ quy tắc tiếng Việt.";
    }

    private boolean isSpam(String original, String normalized) {
        int linkCount = 0;

        var matcher =
                MANY_LINKS_PATTERN.matcher(original == null ? "" : original);

        while (matcher.find()) {
            linkCount++;
        }

        boolean hasAdKeyword =
                containsAny(
                        normalized,
                        " lien he ",
                        " zalo ",
                        " telegram ",
                        " inbox ",
                        " ib ",
                        " dat phong re hon ",
                        " khuyen mai rieng ",
                        " chuyen khoan truc tiep ",
                        " casino ",
                        " ca do "
                );

        return (linkCount >= 1 && hasAdKeyword)
                || linkCount >= 2
                || (hasAdKeyword
                && VIETNAM_PHONE_PATTERN.matcher(original).find());
    }

    private boolean isPrivacyLeak(String original, String normalized) {
        return EMAIL_PATTERN.matcher(original).find()
                || VIETNAM_PHONE_PATTERN.matcher(original).find()
                || CCCD_PATTERN.matcher(original).find()
                || containsAny(
                        normalized,
                        " cccd ",
                        " cmnd ",
                        " can cuoc ",
                        " so tai khoan ",
                        " stk ",
                        " mat khau ",
                        " otp ",
                        " dia chi nha rieng "
                );
    }

    private boolean isRatingCommentMismatch(
            String text,
            Integer rating
    ) {
        if (rating == null) {
            return false;
        }

        boolean veryNegative =
                containsAny(
                        text,
                        " rat te ",
                        " qua te ",
                        " that vong ",
                        " khong hai long ",
                        " khong bao gio quay lai ",
                        " te nhat "
                );

        boolean veryPositive =
                containsAny(
                        text,
                        " rat tot ",
                        " tuyet voi ",
                        " hai long ",
                        " sach se ",
                        " dang tien ",
                        " se quay lai ",
                        " than thien ",
                        " de thuong "
                );

        return (rating >= 4 && veryNegative)
                || (rating <= 2 && veryPositive);
    }

    private String sentiment(String text, Integer rating) {
        if (containsAny(
                text,
                " khong hai long ",
                " that vong ",
                " qua te ",
                " rat te ",
                " te nhat ",
                " chua tot ",
                " khong tot "
        )) {
            return "NEGATIVE";
        }

        if (containsAny(
                text,
                " tuyet voi ",
                " hai long ",
                " sach se ",
                " than thien ",
                " dang tien ",
                " se quay lai ",
                " de thuong ",
                " yen binh ",
                " am cung "
        )) {
            return "POSITIVE";
        }

        if (rating != null && rating <= 2) {
            return "NEGATIVE";
        }

        if (rating != null && rating >= 4) {
            return "POSITIVE";
        }

        return "NEUTRAL";
    }

    private boolean containsAny(String text, String... keywords) {
        String wrapped = " " + safeText(text) + " ";

        for (String keyword : keywords) {
            if (wrapped.contains(keyword)) {
                return true;
            }
        }

        return false;
    }

    private boolean containsAnyToken(
            String text,
            String... tokens
    ) {
        String normalized = safeText(text);

        if (normalized.isBlank()) {
            return false;
        }

        String[] words = normalized.split("\\s+");

        for (String word : words) {
            for (String token : tokens) {
                if (word.equals(token)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Chuẩn hóa nhưng GIỮ DẤU tiếng Việt.
     * Đây là chuỗi chính dùng để kiểm tra profanity/insult dễ nhập nhằng.
     */
    private String normalizeKeepVietnamese(String value) {
        String text =
                value == null
                        ? ""
                        : Normalizer.normalize(
                                value.toLowerCase(Locale.ROOT),
                                Normalizer.Form.NFC
                        );

        return text
                .replaceAll("[^\\p{L}\\p{N}:/._+\\-]+", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    /**
     * Chuẩn hóa bỏ dấu, chỉ dùng cho các rule ít nhập nhằng.
     */
    private String normalizeWithoutAccent(String value) {
        String text =
                value == null
                        ? ""
                        : value.toLowerCase(Locale.ROOT);

        text =
                Normalizer.normalize(text, Normalizer.Form.NFD)
                        .replaceAll("\\p{M}", "");

        text =
                text.replace('đ', 'd')
                        .replace('Đ', 'D');

        return text
                .replaceAll("[^a-z0-9:/._+\\-]+", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String safeText(String value) {
        return value == null ? "" : value;
    }

    private BigDecimal score(boolean condition, double value) {
        return BigDecimal
                .valueOf(condition ? value : 0.0)
                .setScale(4, RoundingMode.HALF_UP);
    }

    private BigDecimal max(BigDecimal... values) {
        BigDecimal max =
                BigDecimal.ZERO.setScale(4);

        for (BigDecimal value : values) {
            if (value != null
                    && value.compareTo(max) > 0) {
                max = value;
            }
        }

        return max;
    }

    private String toJsonArray(Set<String> categories) {
        try {
            return objectMapper.writeValueAsString(categories);
        } catch (Exception exception) {
            return "[\"SAFE\"]";
        }
    }

    private String validJsonRaw(Set<String> categories) {
        try {
            return objectMapper.writeValueAsString(
                    MapHolder.of(
                            "source",
                            "vietnamese-rules-v3",
                            "categories",
                            categories.toString()
                    )
            );
        } catch (Exception exception) {
            return "{\"source\":\"vietnamese-rules-v3\"}";
        }
    }

    private record MapHolder(
            String source,
            String categories
    ) {
        static MapHolder of(
                String sourceKey,
                String source,
                String categoriesKey,
                String categories
        ) {
            return new MapHolder(source, categories);
        }
    }
}
