package com.homestaybooking.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestaybooking.entity.ChatbotDocument;
import com.homestaybooking.entity.ChatbotDocumentChunk;
import com.homestaybooking.repository.ChatbotDocumentChunkRepository;
import com.homestaybooking.repository.ChatbotDocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatbotKnowledgeIndexService {

    private final ChatbotDocumentRepository documentRepository;
    private final ChatbotDocumentChunkRepository chunkRepository;
    private final GeminiEmbeddingService embeddingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatbotKnowledgeIndexService(
            ChatbotDocumentRepository documentRepository,
            ChatbotDocumentChunkRepository chunkRepository,
            GeminiEmbeddingService embeddingService
    ) {
        this.documentRepository = documentRepository;
        this.chunkRepository = chunkRepository;
        this.embeddingService = embeddingService;
    }

    @Transactional
    public int rebuildIndex() {
        chunkRepository.deleteAll();

        List<ChatbotDocument> documents = documentRepository.findAll();
        int totalChunks = 0;

        for (ChatbotDocument document : documents) {
            if (!"ACTIVE".equalsIgnoreCase(document.getStatus())) {
                continue;
            }

            List<String> chunks = splitIntoChunks(document.getContent(), 900);

            for (int i = 0; i < chunks.size(); i++) {
                String chunkText = document.getTitle() + "\n" + chunks.get(i);
                double[] vector = embeddingService.embedForDocument(chunkText);

                ChatbotDocumentChunk chunk = new ChatbotDocumentChunk();
                chunk.setDocumentId(document.getDocumentId());
                chunk.setChunkIndex(i);
                chunk.setChunkContent(chunkText);

                try {
                    chunk.setEmbeddingJson(objectMapper.writeValueAsString(vector));
                } catch (Exception exception) {
                    chunk.setEmbeddingJson(null);
                }

                chunkRepository.save(chunk);
                totalChunks++;
            }
        }

        return totalChunks;
    }

    private List<String> splitIntoChunks(String content, int maxLength) {
        List<String> chunks = new ArrayList<>();

        if (content == null || content.isBlank()) {
            return chunks;
        }

        String[] sentences = content.split("(?<=[.!?。])\\s+|\\n+");

        StringBuilder current = new StringBuilder();

        for (String sentence : sentences) {
            if (sentence == null || sentence.isBlank()) {
                continue;
            }

            if (current.length() + sentence.length() > maxLength) {
                chunks.add(current.toString().trim());
                current = new StringBuilder();
            }

            current.append(sentence.trim()).append(" ");
        }

        if (!current.isEmpty()) {
            chunks.add(current.toString().trim());
        }

        return chunks;
    }
}