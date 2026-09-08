package com.homestaybooking.repository;

import com.homestaybooking.entity.ChatbotDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ChatbotDocumentRepository extends JpaRepository<ChatbotDocument, Integer> {

    List<ChatbotDocument> findByStatusIgnoreCase(String status);

    @Query(value = """
        SELECT *
        FROM chatbot_documents
        WHERE status = 'ACTIVE'
          AND (
              LOWER(title) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(content) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(document_type) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        LIMIT 3
    """, nativeQuery = true)
    List<ChatbotDocument> searchRelevantDocuments(String keyword);
}
