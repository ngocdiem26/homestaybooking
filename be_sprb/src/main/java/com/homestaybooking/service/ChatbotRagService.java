package com.homestaybooking.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestaybooking.entity.ChatbotDocument;
import com.homestaybooking.entity.ChatbotDocumentChunk;
import com.homestaybooking.repository.ChatbotDocumentChunkRepository;
import com.homestaybooking.repository.ChatbotDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ChatbotRagService {

    private static final double MIN_SIMILARITY = 0.50;
    private static final int MAX_CONTEXT_BLOCKS = 4;

    private static final Set<String> STOP_WORDS = Set.of(
            "toi", "minh", "ban", "co", "la", "va", "cua", "cho", "duoc", "nhu", "the",
            "nao", "gi", "ve", "mot", "nhung", "cac", "nay", "do", "muon", "can", "hoi"
    );

    private final ChatbotDocumentChunkRepository chunkRepository;
    private final ChatbotDocumentRepository documentRepository;
    private final GeminiEmbeddingService embeddingService;
    private final ObjectMapper objectMapper;

    /**
     * Tìm context bằng Hybrid RAG:
     * 1) keyword/title matching để bảo đảm các câu như "chính sách đặt phòng"
     *    lấy đúng tài liệu có tiêu đề tương ứng;
     * 2) semantic embedding + cosine similarity để hiểu câu hỏi diễn đạt khác từ ngữ;
     * 3) gộp và loại trùng context.
     */
    public String retrieveContext(String question) {
        return retrieveContext(question, new String[0]);
    }

    public String retrieveContext(String question, String... preferredDocumentTypes) {
        if (question == null || question.isBlank()) {
            return "";
        }

        List<ChatbotDocument> activeDocuments =
                documentRepository.findByStatusIgnoreCase("ACTIVE");

        if (activeDocuments.isEmpty()) {
            return "";
        }

        Set<String> preferredTypes = normalizeDocumentTypes(preferredDocumentTypes);
        Map<Integer, ChatbotDocument> activeDocumentMap = new LinkedHashMap<>();

        for (ChatbotDocument document : activeDocuments) {
            if (document == null || document.getDocumentId() == null) {
                continue;
            }

            if (!matchesPreferredType(document, preferredTypes)) {
                continue;
            }

            activeDocumentMap.put(document.getDocumentId(), document);
        }

        if (activeDocumentMap.isEmpty()) {
            // Nếu intent truyền loại tài liệu quá hẹp nhưng DB chưa có loại đó,
            // fallback sang toàn bộ tài liệu ACTIVE thay vì trả context rỗng.
            for (ChatbotDocument document : activeDocuments) {
                if (document != null && document.getDocumentId() != null) {
                    activeDocumentMap.put(document.getDocumentId(), document);
                }
            }
        }

        LinkedHashSet<String> contextBlocks = new LinkedHashSet<>();

        // 1. Keyword/title retrieval chạy trước để câu hỏi chính sách lấy đúng document.
        keywordContextBlocks(
                question,
                new ArrayList<>(activeDocumentMap.values()),
                2
        ).forEach(contextBlocks::add);

        // 2. Semantic retrieval bổ sung các đoạn gần nghĩa.
        semanticContextBlocks(
                question,
                activeDocumentMap,
                3
        ).forEach(contextBlocks::add);

        if (contextBlocks.isEmpty()) {
            return "";
        }

        return contextBlocks.stream()
                .limit(MAX_CONTEXT_BLOCKS)
                .reduce("", (left, right) ->
                        left.isBlank()
                                ? right
                                : left + "\n\n" + right
                );
    }

    private List<String> semanticContextBlocks(
            String question,
            Map<Integer, ChatbotDocument> activeDocumentMap,
            int limit
    ) {
        double[] queryVector = embeddingService.embedForQuery(question);

        if (queryVector == null || queryVector.length == 0) {
            return List.of();
        }

        return chunkRepository.findByEmbeddingJsonIsNotNull()
                .stream()
                .filter(chunk -> chunk != null && activeDocumentMap.containsKey(chunk.getDocumentId()))
                .map(chunk -> {
                    ChatbotDocument document = activeDocumentMap.get(chunk.getDocumentId());
                    double cosine = cosineSimilarity(
                            queryVector,
                            parseVector(chunk.getEmbeddingJson())
                    );

                    // Keyword boost nhỏ giúp exact-title/context không bị semantic candidate khác lấn át.
                    int lexicalScore = lexicalScore(
                            meaningfulTokens(question),
                            safe(document.getTitle()) + " "
                                    + safe(document.getDocumentType()) + " "
                                    + safe(chunk.getChunkContent())
                    );

                    double combinedScore = cosine + Math.min(0.18, lexicalScore * 0.015);
                    return new ScoredChunk(chunk, document, combinedScore);
                })
                .filter(item -> item.score() >= MIN_SIMILARITY)
                .sorted(Comparator.comparingDouble(ScoredChunk::score).reversed())
                .limit(Math.max(1, limit))
                .map(item -> formatContextBlock(
                        item.document(),
                        extractChunkBody(item.chunk().getChunkContent())
                ))
                .filter(value -> value != null && !value.isBlank())
                .toList();
    }

    private List<String> keywordContextBlocks(
            String question,
            List<ChatbotDocument> documents,
            int limit
    ) {
        Set<String> queryTokens = meaningfulTokens(question);

        if (queryTokens.isEmpty()) {
            return List.of();
        }

        List<ScoredDocument> scored = new ArrayList<>();

        for (ChatbotDocument document : documents) {
            if (document == null) {
                continue;
            }

            String normalizedTitle = normalize(document.getTitle());
            String normalizedType = normalize(document.getDocumentType());
            String normalizedContent = normalize(document.getContent());

            int score = 0;

            for (String token : queryTokens) {
                if (normalizedTitle.contains(token)) {
                    score += 6;
                }

                if (normalizedType.contains(token)) {
                    score += 3;
                }

                if (normalizedContent.contains(token)) {
                    score += 1;
                }
            }

            // Boost mạnh khi toàn bộ cụm từ của câu hỏi nằm trong title.
            String normalizedQuestion = normalize(question);
            if (!normalizedQuestion.isBlank()
                    && normalizedTitle.contains(normalizedQuestion)) {
                score += 20;
            }

            if (score > 0) {
                scored.add(new ScoredDocument(document, score));
            }
        }

        return scored.stream()
                .sorted(Comparator.comparingInt(ScoredDocument::score).reversed())
                .limit(Math.max(1, limit))
                .map(item -> formatContextBlock(
                        item.document(),
                        limit(safe(item.document().getContent()), 1800)
                ))
                .filter(value -> value != null && !value.isBlank())
                .toList();
    }

    private String formatContextBlock(ChatbotDocument document, String content) {
        String title = safe(document == null ? null : document.getTitle()).trim();
        String body = safe(content).trim();

        if (body.isBlank()) {
            return "";
        }

        if (title.isBlank()) {
            return body;
        }

        return "Nguồn: " + title + "\n" + body;
    }

    private String extractChunkBody(String chunkContent) {
        if (chunkContent == null || chunkContent.isBlank()) {
            return "";
        }

        String marker = "\nNội dung: ";
        int index = chunkContent.indexOf(marker);

        if (index >= 0) {
            return chunkContent.substring(index + marker.length()).trim();
        }

        return chunkContent.trim();
    }

    private Set<String> normalizeDocumentTypes(String... documentTypes) {
        Set<String> result = new LinkedHashSet<>();

        if (documentTypes == null) {
            return result;
        }

        for (String type : documentTypes) {
            if (type == null || type.isBlank()) {
                continue;
            }

            result.add(type.trim().toUpperCase(Locale.ROOT));
        }

        return result;
    }

    private boolean matchesPreferredType(
            ChatbotDocument document,
            Set<String> preferredTypes
    ) {
        if (preferredTypes == null || preferredTypes.isEmpty()) {
            return true;
        }

        String type = safe(document.getDocumentType())
                .trim()
                .toUpperCase(Locale.ROOT);

        return preferredTypes.contains(type);
    }

    private int lexicalScore(Set<String> queryTokens, String haystackValue) {
        if (queryTokens == null || queryTokens.isEmpty()) {
            return 0;
        }

        String haystack = normalize(haystackValue);
        int score = 0;

        for (String token : queryTokens) {
            if (haystack.contains(token)) {
                score++;
            }
        }

        return score;
    }

    private Set<String> meaningfulTokens(String value) {
        String normalized = normalize(value);
        Set<String> tokens = new LinkedHashSet<>();

        for (String token : normalized.split("\\s+")) {
            if (token.length() < 3 || STOP_WORDS.contains(token)) {
                continue;
            }

            tokens.add(token);
        }

        return tokens;
    }

    private double[] parseVector(String json) {
        try {
            double[] vector = objectMapper.readValue(json, double[].class);
            return vector == null ? new double[0] : vector;
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

    private String normalize(String value) {
        if (value == null) {
            return "";
        }

        return Normalizer.normalize(
                        value.toLowerCase(Locale.ROOT),
                        Normalizer.Form.NFD
                )
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd')
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String limit(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }

        return value.substring(0, Math.max(0, maxLength - 3)) + "...";
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private record ScoredChunk(
            ChatbotDocumentChunk chunk,
            ChatbotDocument document,
            double score
    ) {
    }

    private record ScoredDocument(
            ChatbotDocument document,
            int score
    ) {
    }
}
