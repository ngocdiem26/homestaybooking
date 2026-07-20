package com.homestaybooking.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chatbot_document_chunks")
public class ChatbotDocumentChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chunk_id")
    private Long chunkId;

    @Column(name = "document_id", nullable = false)
    private Integer documentId;

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Column(name = "chunk_content", nullable = false, columnDefinition = "TEXT")
    private String chunkContent;

    @Column(name = "embedding_json", columnDefinition = "LONGTEXT")
    private String embeddingJson;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Long getChunkId() {
        return chunkId;
    }

    public void setChunkId(Long chunkId) {
        this.chunkId = chunkId;
    }

    public Integer getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Integer documentId) {
        this.documentId = documentId;
    }

    public Integer getChunkIndex() {
        return chunkIndex;
    }

    public void setChunkIndex(Integer chunkIndex) {
        this.chunkIndex = chunkIndex;
    }

    public String getChunkContent() {
        return chunkContent;
    }

    public void setChunkContent(String chunkContent) {
        this.chunkContent = chunkContent;
    }

    public String getEmbeddingJson() {
        return embeddingJson;
    }

    public void setEmbeddingJson(String embeddingJson) {
        this.embeddingJson = embeddingJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}