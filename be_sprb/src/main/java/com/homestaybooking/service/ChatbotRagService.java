package com.homestaybooking.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestaybooking.entity.ChatbotDocumentChunk;
import com.homestaybooking.repository.ChatbotDocumentChunkRepository;
import com.homestaybooking.repository.ChatbotDocumentRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class ChatbotRagService {

    private final ChatbotDocumentChunkRepository chunkRepository;
    private final ChatbotDocumentRepository documentRepository;
    private final GeminiEmbeddingService embeddingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatbotRagService(
            ChatbotDocumentChunkRepository chunkRepository,
            ChatbotDocumentRepository documentRepository,
            GeminiEmbeddingService embeddingService
    ) {
        this.chunkRepository = chunkRepository;
        this.documentRepository = documentRepository;
        this.embeddingService = embeddingService;
    }

    public String retrieveContext(String question) {
        double[] queryVector = embeddingService.embedForQuery(question);

        if (queryVector.length == 0) {
            return fallbackKeywordSearch(question);
        }

        List<ScoredChunk> scoredChunks = chunkRepository.findByEmbeddingJsonIsNotNull()
                .stream()
                .map(chunk -> new ScoredChunk(chunk, cosineSimilarity(queryVector, parseVector(chunk.getEmbeddingJson()))))
                .filter(item -> item.score > 0.55)
                .sorted(Comparator.comparingDouble(ScoredChunk::score).reversed())
                .limit(4)
                .toList();

        if (scoredChunks.isEmpty()) {
            return fallbackKeywordSearch(question);
        }

        StringBuilder context = new StringBuilder();

        for (ScoredChunk item : scoredChunks) {
            context.append("- ")
                    .append(item.chunk().getChunkContent())
                    .append("\n");
        }

        return context.toString();
    }

    private String fallbackKeywordSearch(String question) {
        String keyword = question == null ? "" : question.trim();

        if (keyword.length() > 40) {
            keyword = keyword.substring(0, 40);
        }

        return documentRepository.searchRelevantDocuments(keyword)
                .stream()
                .map(doc -> "- " + doc.getTitle() + ": " + doc.getContent())
                .reduce("", (a, b) -> a + "\n" + b);
    }

    private double[] parseVector(String json) {
        try {
            return objectMapper.readValue(json, double[].class);
        } catch (Exception exception) {
            return new double[0];
        }
    }

    private double cosineSimilarity(double[] a, double[] b) {
        if (a.length == 0 || b.length == 0 || a.length != b.length) {
            return 0;
        }

        double dot = 0;
        double normA = 0;
        double normB = 0;

        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA == 0 || normB == 0) {
            return 0;
        }

        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private record ScoredChunk(ChatbotDocumentChunk chunk, double score) {
    }
}