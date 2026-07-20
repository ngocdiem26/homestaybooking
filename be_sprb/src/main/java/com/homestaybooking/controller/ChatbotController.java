package com.homestaybooking.controller;

import com.homestaybooking.dto.request.chatbot.ChatRequest;
import com.homestaybooking.dto.response.chatbot.ChatResponse;
import com.homestaybooking.service.ChatbotKnowledgeIndexService;
import com.homestaybooking.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public/chatbot")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final ChatbotKnowledgeIndexService indexService;

    public ChatbotController(
            ChatbotService chatbotService,
            ChatbotKnowledgeIndexService indexService
    ) {
        this.chatbotService = chatbotService;
        this.indexService = indexService;
    }

    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(@RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatbotService.handleMessage(request));
    }

    @PostMapping("/reindex")
    public ResponseEntity<Map<String, Object>> rebuildIndex() {
        int totalChunks = indexService.rebuildIndex();

        return ResponseEntity.ok(Map.of(
                "message", "Đã tạo lại chỉ mục RAG thành công",
                "totalChunks", totalChunks
        ));
    }
}