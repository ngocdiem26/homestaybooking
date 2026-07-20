package com.homestaybooking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class GeminiEmbeddingService {

    @Value("${gemini.embedding.api.key:}")
    private String apiKey;

    @Value("${gemini.embedding.model:gemini-embedding-001}")
    private String embeddingModel;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public double[] embedForDocument(String text) {
        return embed(text, "RETRIEVAL_DOCUMENT");
    }

    public double[] embedForQuery(String text) {
        return embed(text, "RETRIEVAL_QUERY");
    }

    private double[] embed(String text, String taskType) {
        if (apiKey == null || apiKey.isBlank()) {
            return new double[0];
        }

        try {
            String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/"
                    + embeddingModel
                    + ":embedContent?key="
                    + apiKey;

            ObjectNode body = objectMapper.createObjectNode();
            body.put("model", "models/" + embeddingModel);
            body.put("taskType", taskType);

            ObjectNode content = body.putObject("content");
            content.putArray("parts")
                    .addObject()
                    .put("text", text);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body.toString(), StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return new double[0];
            }

            JsonNode values = objectMapper.readTree(response.body())
                    .path("embedding")
                    .path("values");

            if (!values.isArray()) {
                return new double[0];
            }

            double[] vector = new double[values.size()];
            for (int i = 0; i < values.size(); i++) {
                vector[i] = values.get(i).asDouble();
            }

            return vector;

        } catch (Exception exception) {
            return new double[0];
        }
    }
}