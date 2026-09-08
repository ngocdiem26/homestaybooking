package com.homestaybooking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.chatbot.api.key:}")
    private String apiKey;

    @Value("${gemini.chatbot.model:gemini-2.5-flash}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public String generateAnswer(String prompt, String fallbackAnswer) {
        /*
         * Trả lời chatbot/RAG chủ yếu là diễn đạt dữ liệu backend đã truy xuất.
         * 1600 tokens đủ rộng để tránh bị cắt giữa câu.
         */
        return generateContent(prompt, fallbackAnswer, 0.35, 1600, null);
    }

    public String generateJsonAnswer(String prompt, String fallbackAnswer) {
        return generateContent(prompt, fallbackAnswer, 0.0, 2048, "application/json");
    }

    public String generateJsonAnswer(String prompt, String fallbackAnswer, int maxOutputTokens) {
        return generateContent(
                prompt,
                fallbackAnswer,
                0.0,
                Math.max(2048, maxOutputTokens),
                "application/json"
        );
    }

    public String generateJsonAnswerWithConfig(
            String prompt,
            String fallbackAnswer,
            String configuredApiKey,
            String configuredModel
    ) {
        return generateContent(
                prompt,
                fallbackAnswer,
                0.0,
                2048,
                "application/json",
                configuredApiKey,
                configuredModel
        );
    }

    private String generateContent(
            String prompt,
            String fallbackAnswer,
            double temperature,
            int maxOutputTokens,
            String responseMimeType
    ) {
        return generateContent(
                prompt,
                fallbackAnswer,
                temperature,
                maxOutputTokens,
                responseMimeType,
                apiKey,
                model
        );
    }

    private String generateContent(
            String prompt,
            String fallbackAnswer,
            double temperature,
            int maxOutputTokens,
            String responseMimeType,
            String selectedApiKey,
            String selectedModel
    ) {
        if (selectedApiKey == null || selectedApiKey.isBlank()) {
            System.err.println(
                    "[GeminiService] Missing gemini.chatbot.api.key. Using fallback answer."
            );
            return fallbackAnswer;
        }

        try {
            String effectiveModel =
                    selectedModel == null || selectedModel.isBlank()
                            ? "gemini-2.5-flash"
                            : selectedModel.trim();

            String endpoint =
                    "https://generativelanguage.googleapis.com/v1beta/models/"
                            + effectiveModel
                            + ":generateContent?key="
                            + selectedApiKey.trim();

            Map<String, Object> generationConfig = new LinkedHashMap<>();
            generationConfig.put("temperature", temperature);
            generationConfig.put("maxOutputTokens", maxOutputTokens);

            /*
             * Gemini 2.5 Flash dùng dynamic thinking mặc định.
             * Với chatbot và intent extraction, không cần reasoning dài.
             * Tắt thinking để tránh thinking token chiếm output budget
             * và làm phần trả lời nhìn thấy bị cắt.
             */
            if (effectiveModel.toLowerCase().contains("gemini-2.5-flash")) {
                generationConfig.put(
                        "thinkingConfig",
                        Map.of("thinkingBudget", 0)
                );
            }

            if (responseMimeType != null && !responseMimeType.isBlank()) {
                generationConfig.put("responseMimeType", responseMimeType);
            }

            Map<String, Object> jsonBodyMap = Map.of(
                    "contents",
                    List.of(
                            Map.of(
                                    "parts",
                                    List.of(
                                            Map.of(
                                                    "text",
                                                    prompt == null ? "" : prompt
                                            )
                                    )
                            )
                    ),
                    "generationConfig",
                    generationConfig
            );

            String jsonBody = objectMapper.writeValueAsString(jsonBodyMap);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .POST(
                            HttpRequest.BodyPublishers.ofString(
                                    jsonBody,
                                    StandardCharsets.UTF_8
                            )
                    )
                    .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                System.err.println(
                        "[GeminiService] HTTP "
                                + response.statusCode()
                                + " from Gemini API. Body: "
                                + abbreviate(response.body(), 900)
                );
                return fallbackAnswer;
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode candidate = root.path("candidates").path(0);
            JsonNode parts = candidate.path("content").path("parts");

            StringBuilder answer = new StringBuilder();

            /*
             * Không chỉ đọc parts[0].
             * Nếu Gemini trả nhiều text part thì ghép đầy đủ lại.
             */
            if (parts.isArray()) {
                for (JsonNode part : parts) {
                    JsonNode textNode = part.path("text");

                    if (!textNode.isMissingNode()
                            && !textNode.asText().isBlank()) {

                        if (!answer.isEmpty()) {
                            answer.append("\n");
                        }

                        answer.append(textNode.asText());
                    }
                }
            }

            String finishReason =
                    candidate.path("finishReason").asText("");

            if (answer.isEmpty()) {
                System.err.println(
                        "[GeminiService] Empty response text. finishReason="
                                + finishReason
                );
                return fallbackAnswer;
            }

            if ("MAX_TOKENS".equalsIgnoreCase(finishReason)) {
                System.err.println(
                        "[GeminiService] Gemini stopped because MAX_TOKENS. "
                                + "Visible response may be incomplete."
                );
            }

            return answer.toString().trim();

        } catch (Exception exception) {
            System.err.println(
                    "[GeminiService] generateContent failed: "
                            + exception.getMessage()
            );
            return fallbackAnswer;
        }
    }

    private String abbreviate(String value, int maxLength) {
        if (value == null) {
            return "";
        }

        if (value.length() <= maxLength) {
            return value;
        }

        return value.substring(0, Math.max(0, maxLength)) + "...";
    }
}
