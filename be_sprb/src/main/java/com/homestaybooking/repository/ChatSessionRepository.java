package com.homestaybooking.repository;

import com.homestaybooking.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Integer> {
}