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
        return generateContent(prompt, fallbackAnswer, 0.4, 700, null);
    }

    public String generateJsonAnswer(String prompt, String fallbackAnswer) {
        return generateContent(prompt, fallbackAnswer, 0.0, 2048, "application/json");
    }

    public String generateJsonAnswerWithConfig(String prompt, String fallbackAnswer, String configuredApiKey, String configuredModel) {
        return generateContent(prompt, fallbackAnswer, 0.0, 2048, "application/json", configuredApiKey, configuredModel);
    }

    private String generateContent(String prompt, String fallbackAnswer, double temperature, int maxOutputTokens, String responseMimeType) {
        return generateContent(prompt, fallbackAnswer, temperature, maxOutputTokens, responseMimeType, apiKey, model);
    }

    private String generateContent(String prompt, String fallbackAnswer, double temperature, int maxOutputTokens, String responseMimeType, String selectedApiKey, String selectedModel) {
        if (selectedApiKey == null || selectedApiKey.isBlank()) {
            return fallbackAnswer;
        }

        try {
            String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/"
                    + (selectedModel == null || selectedModel.isBlank() ? "gemini-2.5-flash" : selectedModel.trim())
                    + ":generateContent?key="
                    + selectedApiKey.trim();

            Map<String, Object> generationConfig = new LinkedHashMap<>();
            generationConfig.put("temperature", temperature);
            generationConfig.put("maxOutputTokens", maxOutputTokens);
            if (responseMimeType != null && !responseMimeType.isBlank()) {
                generationConfig.put("responseMimeType", responseMimeType);
            }

            Map<String, Object> jsonBodyMap = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt == null ? "" : prompt)))),
                    "generationConfig", generationConfig
            );
            String jsonBody = objectMapper.writeValueAsString(jsonBodyMap);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return fallbackAnswer;
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode textNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            if (textNode.isMissingNode() || textNode.asText().isBlank()) {
                return fallbackAnswer;
            }

            return textNode.asText();

        } catch (Exception exception) {
            return fallbackAnswer;
        }
    }
}