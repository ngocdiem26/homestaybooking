package com.homestaybooking.repository;

import com.homestaybooking.entity.ChatbotDocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatbotDocumentChunkRepository extends JpaRepository<ChatbotDocumentChunk, Long> {
    List<ChatbotDocumentChunk> findByEmbeddingJsonIsNotNull();
}