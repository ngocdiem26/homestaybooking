package com.homestaybooking.controller;

import com.homestaybooking.dto.request.chatbot.ChatRequest;
import com.homestaybooking.dto.response.chatbot.ChatResponse;
import com.homestaybooking.dto.response.chatbot.ChatbotHistoryResponse;
import com.homestaybooking.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/chatbot")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(
            @RequestBody ChatRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return ResponseEntity.ok(chatbotService.handleMessage(request, authorizationHeader));
    }

    /**
     * Lịch sử chỉ được trả về khi request có JWT hợp lệ.
     * Khách chưa đăng nhập vẫn chat bình thường nhưng lịch sử của họ chỉ được giữ ở browser,
     * tránh việc truy vấn nhầm các session có user_id = NULL của khách khác.
     */
    @GetMapping("/history")
    public ResponseEntity<ChatbotHistoryResponse> getHistory(
            @RequestParam(value = "beforeSessionId", required = false) Integer beforeSessionId,
            @RequestParam(value = "limit", defaultValue = "5") Integer limit,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return ResponseEntity.ok(
                chatbotService.getHistory(authorizationHeader, beforeSessionId, limit)
        );
    }
}
