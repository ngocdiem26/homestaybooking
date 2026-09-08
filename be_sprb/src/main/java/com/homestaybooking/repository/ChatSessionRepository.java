package com.homestaybooking.repository;

import com.homestaybooking.entity.ChatSession;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Integer> {

    @Query("""
            select s
            from ChatSession s
            where s.userId = :userId
              and (:beforeSessionId is null or s.sessionId < :beforeSessionId)
            order by s.sessionId desc
            """)
    List<ChatSession> findHistoryPage(
            @Param("userId") Integer userId,
            @Param("beforeSessionId") Integer beforeSessionId,
            Pageable pageable
    );
}
