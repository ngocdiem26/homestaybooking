package com.homestaybooking.controller;

import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.repository.ChatbotDocumentChunkRepository;
import com.homestaybooking.repository.ChatbotDocumentRepository;
import com.homestaybooking.repository.UserRepository;
import com.homestaybooking.security.JwtUtil;
import com.homestaybooking.service.ChatbotKnowledgeIndexService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/chatbot")
@RequiredArgsConstructor
public class AdminChatbotController {

    private final ChatbotKnowledgeIndexService indexService;
    private final ChatbotDocumentRepository documentRepository;
    private final ChatbotDocumentChunkRepository chunkRepository;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @PostMapping("/reindex")
    public ResponseEntity<Map<String, Object>> rebuildIndex(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        requireAdmin(authorizationHeader);
        int totalChunks = indexService.rebuildIndex();
        return ResponseEntity.ok(Map.of(
                "message", "Đã tạo lại chỉ mục RAG thành công",
                "totalChunks", totalChunks
        ));
    }

    @GetMapping("/rag-status")
    public ResponseEntity<Map<String, Object>> ragStatus(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        requireAdmin(authorizationHeader);
        long activeDocuments = documentRepository.findByStatusIgnoreCase("ACTIVE").size();
        long chunks = chunkRepository.count();
        return ResponseEntity.ok(Map.of(
                "activeDocuments", activeDocuments,
                "chunks", chunks,
                "indexed", chunks > 0
        ));
    }

    private User requireAdmin(String authorizationHeader) {
        String email = jwtUtil.extractEmailFromAuthorizationHeader(authorizationHeader);
        if (email == null || email.isBlank()) {
            throw new AppException("Vui lòng đăng nhập bằng tài khoản admin");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Không tìm thấy tài khoản đang đăng nhập"));
        String role = user.getRole() == null || user.getRole().getRoleName() == null
                ? ""
                : user.getRole().getRoleName().trim().toUpperCase(Locale.ROOT);
        if (!"ADMIN".equals(role)) {
            throw new AppException("Bạn không có quyền tạo lại chỉ mục chatbot");
        }
        return user;
    }
}
