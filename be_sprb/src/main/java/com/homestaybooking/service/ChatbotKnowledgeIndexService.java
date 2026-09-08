package com.homestaybooking.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestaybooking.entity.ChatbotDocument;
import com.homestaybooking.entity.ChatbotDocumentChunk;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.ChatbotDocumentChunkRepository;
import com.homestaybooking.repository.ChatbotDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatbotKnowledgeIndexService {

    private static final int CHUNK_SIZE = 900;

    private final ChatbotDocumentRepository documentRepository;
    private final ChatbotDocumentChunkRepository chunkRepository;
    private final GeminiEmbeddingService embeddingService;
    private final ObjectMapper objectMapper;

    public int rebuildIndex() {
        List<ChatbotDocument> documents = documentRepository.findByStatusIgnoreCase("ACTIVE");
        List<ChatbotDocumentChunk> newChunks = new ArrayList<>();

        for (ChatbotDocument document : documents) {
            List<String> chunks = splitIntoChunks(document.getContent(), CHUNK_SIZE);
            for (int i = 0; i < chunks.size(); i++) {
                String chunkText = buildChunkText(document, chunks.get(i));
                double[] vector = embeddingService.embedForDocument(chunkText);
                if (vector == null || vector.length == 0) {
                    throw new AppException(
                            "Không tạo được embedding. Hãy kiểm tra gemini.embedding.api.key trước khi reindex. Chỉ mục cũ chưa bị xóa."
                    );
                }

                ChatbotDocumentChunk chunk = new ChatbotDocumentChunk();
                chunk.setDocumentId(document.getDocumentId());
                chunk.setChunkIndex(i);
                chunk.setChunkContent(chunkText);
                try {
                    chunk.setEmbeddingJson(objectMapper.writeValueAsString(vector));
                } catch (Exception exception) {
                    throw new AppException("Không thể lưu vector embedding của tài liệu chatbot");
                }
                newChunks.add(chunk);
            }
        }

        // Chỉ xóa index cũ sau khi toàn bộ embedding mới đã tạo thành công.
        chunkRepository.deleteAllInBatch();
        if (!newChunks.isEmpty()) {
            chunkRepository.saveAll(newChunks);
        }
        return newChunks.size();
    }

    private String buildChunkText(ChatbotDocument document, String content) {
        return "Tiêu đề: " + safe(document.getTitle())
                + "\nLoại: " + safe(document.getDocumentType())
                + "\nNội dung: " + content;
    }

    private List<String> splitIntoChunks(String content, int maxLength) {
        List<String> chunks = new ArrayList<>();
        if (content == null || content.isBlank()) return chunks;

        String normalized = content.replaceAll("\\s+", " ").trim();
        int cursor = 0;
        while (cursor < normalized.length()) {
            int end = Math.min(normalized.length(), cursor + maxLength);
            if (end < normalized.length()) {
                int lastSpace = normalized.lastIndexOf(' ', end);
                if (lastSpace > cursor + maxLength / 2) end = lastSpace;
            }
            String chunk = normalized.substring(cursor, end).trim();
            if (!chunk.isBlank()) chunks.add(chunk);
            cursor = end;
            while (cursor < normalized.length() && Character.isWhitespace(normalized.charAt(cursor))) cursor++;
        }
        return chunks;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
