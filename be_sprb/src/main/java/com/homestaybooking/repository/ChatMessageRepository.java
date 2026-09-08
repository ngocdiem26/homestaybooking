package com.homestaybooking.repository;

import com.homestaybooking.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(Integer sessionId);

    List<ChatMessage> findTop12BySessionIdOrderByCreatedAtDesc(Integer sessionId);

    Optional<ChatMessage> findTopBySessionIdOrderByCreatedAtDesc(Integer sessionId);
}
