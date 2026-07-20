import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaTimes,
  FaPaperPlane,
  FaRobot,
  FaUser,
} from "react-icons/fa";

import { chatbotService } from "../../services/chatbotService";
import ChatbotRichData from "./ChatbotRichData";
import "./ChatWidget.css";

const CHATBOT_HISTORY_KEY = "cozygo_chatbot_history_v1";
const CHATBOT_SESSION_KEY = "cozygo_chatbot_session_id";
const MAX_STORED_MESSAGES = 80;

const quickSuggestions = [
  "Tìm homestay ở Đà Lạt cho 4 người dưới 1 triệu",
  "Có mã giảm giá nào không?",
  "Gợi ý địa điểm du lịch đẹp",
  "Có hoạt động trải nghiệm nào ở Đà Lạt không?",
  "Hướng dẫn đặt phòng",
  "Thanh toán SePay là gì?",
  "Tôi muốn khiếu nại booking",
];

const welcomeMessage = {
  id: "welcome",
  sender: "BOT",
  text: "Xin chào! Tôi là trợ lý HomestayBooking. Tôi có thể giúp bạn tìm homestay, xem khuyến mãi, gợi ý địa điểm, hoạt động trải nghiệm, hướng dẫn đặt phòng, thanh toán và khiếu nại.",
  dataType: "TEXT",
  data: null,
  suggestions: quickSuggestions,
};

function readChatbotHistory() {
  if (typeof window === "undefined") {
    return { sessionId: null, messages: [welcomeMessage] };
  }

  try {
    const rawMessages = window.localStorage.getItem(CHATBOT_HISTORY_KEY);
    const storedMessages = rawMessages ? JSON.parse(rawMessages) : null;
    const messages = Array.isArray(storedMessages) && storedMessages.length > 0 ? storedMessages : [welcomeMessage];
    return {
      sessionId: window.localStorage.getItem(CHATBOT_SESSION_KEY) || null,
      messages,
    };
  } catch {
    return { sessionId: null, messages: [welcomeMessage] };
  }
}

function saveChatbotHistory(messages, sessionId) {
  if (typeof window === "undefined") return;

  try {
    const trimmedMessages = messages.slice(-MAX_STORED_MESSAGES);
    window.localStorage.setItem(CHATBOT_HISTORY_KEY, JSON.stringify(trimmedMessages));
    if (sessionId) {
      window.localStorage.setItem(CHATBOT_SESSION_KEY, sessionId);
    }
  } catch {
    // Ignore storage quota/private mode errors. Chat still works in memory.
  }
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function buildLocalFallbackResponse(messageText) {
  const text = normalizeText(messageText);

  if (text.includes("khuyen mai") || text.includes("ma giam gia") || text.includes("voucher") || text.includes("uu dai")) {
    return {
      answer: "Hiện tôi chưa kết nối được backend để lấy danh sách mã mới nhất. Khi backend chạy, tôi sẽ hiển thị mã đang hoạt động từ database. Bạn có thể nhập mã ở bước xác nhận đặt phòng; nếu mã không đủ điều kiện, hệ thống sẽ báo ngay.",
      intent: "PROMOTION_LOOKUP",
      dataType: "TEXT",
      suggestions: ["Hướng dẫn đặt phòng", "Tìm homestay ở Đà Lạt", "Thanh toán SePay là gì?"],
    };
  }

  if (text.includes("sepay") || text.includes("thanh toan") || text.includes("qr") || text.includes("chuyen khoan")) {
    return {
      answer: "SePay là hình thức thanh toán chuyển khoản/QR. Khi đặt phòng, bạn chọn phương thức SePay, hệ thống tạo đơn và thông tin thanh toán. Sau khi thanh toán được ghi nhận, đơn sẽ chờ chủ homestay xác nhận.",
      intent: "SEPAY_GUIDE",
      dataType: "TEXT",
      suggestions: ["Thanh toán tại chỗ là gì?", "Hướng dẫn đặt phòng", "Tôi muốn khiếu nại booking"],
    };
  }

  if (text.includes("khieu nai") || text.includes("bao cao") || text.includes("tranh chap")) {
    return {
      answer: "Bạn có thể gửi khiếu nại từ trang cá nhân, mục Đơn đặt phòng của bạn. Mở chi tiết đơn đã hoàn thành, chọn Viết khiếu nại, nhập tiêu đề và nội dung. Admin sẽ xử lý và phản hồi qua email, trạng thái được theo dõi trong mục Khiếu nại của tôi.",
      intent: "COMPLAINT_GUIDE",
      dataType: "TEXT",
      suggestions: ["Xem đơn đặt phòng của tôi", "Hướng dẫn đặt phòng", "Tìm homestay"],
    };
  }

  if (text.includes("dat phong") || text.includes("booking") || text.includes("cach dat")) {
    return {
      answer: "Quy trình đặt phòng gồm: chọn homestay, chọn ngày nhận/trả phòng và số khách, kiểm tra giá, chọn dịch vụ thêm/mã khuyến mãi, chọn phương thức thanh toán, rồi gửi yêu cầu đặt phòng. Chủ homestay sẽ xác nhận đơn.",
      intent: "BOOKING_GUIDE",
      dataType: "TEXT",
      suggestions: ["Tìm homestay ở Đà Lạt", "Có mã giảm giá nào không?", "Thanh toán SePay là gì?"],
    };
  }

  if (text.includes("tim") || text.includes("homestay") || text.includes("da lat") || text.includes("can tho")) {
    return {
      answer: "Tôi chưa kết nối được backend để lấy danh sách homestay thật. Bạn có thể thử mở trang tìm kiếm hoặc chạy backend ở port 8080 để tôi trả về card homestay từ database.",
      intent: "SEARCH_HOMESTAY",
      dataType: "TEXT",
      suggestions: ["Tìm homestay ở Đà Lạt", "Tìm homestay cho 4 người", "Gợi ý địa điểm du lịch đẹp"],
    };
  }

  return {
    answer: "Hiện chatbot chưa kết nối được backend. Tôi vẫn có thể hướng dẫn nhanh về đặt phòng, thanh toán SePay, mã khuyến mãi và khiếu nại. Nếu muốn xem dữ liệu thật từ database, hãy chạy backend port 8080.",
    intent: "LOCAL_FALLBACK",
    dataType: "TEXT",
    suggestions: ["Hướng dẫn đặt phòng", "Có mã giảm giá nào không?", "Tôi muốn khiếu nại booking"],
  };
}

export default function ChatWidget() {
  const storedChatbotState = useMemo(() => readChatbotHistory(), []);
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(storedChatbotState.sessionId);
  const [messages, setMessages] = useState(storedChatbotState.messages);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    saveChatbotHistory(messages, sessionId);
  }, [messages, sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  const handleSuggestionClick = (suggestion) => {
    if (suggestion === "Đăng nhập") {
      window.location.assign("/login");
      return;
    }

    sendMessage(suggestion);
  };

  const sendMessage = async (customMessage) => {
    const messageText = (customMessage || input).trim();

    if (!messageText || loading) return;

    const userMessage = {
      id: `${Date.now()}-user`,
      sender: "USER",
      text: messageText,
      dataType: "TEXT",
      data: null,
      suggestions: [],
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage({
        sessionId,
        message: messageText,
        currentPage: window.location.pathname,
      });

      if (response.sessionId) {
        setSessionId(response.sessionId);
      }

      const botMessage = {
        id: `${Date.now()}-bot`,
        sender: "BOT",
        text: response.answer || "Xin lỗi, tôi chưa có câu trả lời phù hợp.",
        intent: response.intent,
        dataType: response.dataType || "TEXT",
        data: response.data || null,
        suggestions: response.suggestions || [],
      };

      setMessages((current) => [...current, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);

      const fallback = buildLocalFallbackResponse(messageText);

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          sender: "BOT",
          text: fallback.answer,
          intent: fallback.intent,
          dataType: fallback.dataType || "TEXT",
          data: null,
          suggestions: fallback.suggestions || [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] h-16 w-16 rounded-full bg-[#a64d23] border-4 border-white text-white shadow-2xl flex items-center justify-center hover:scale-105 transition"
          title="Mở trợ lý chatbot"
        >
          <FaRobot className="text-2xl" />
        </button>
      )} */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="chatbot-floating-btn fixed bottom-6 right-6 z-[9999] h-16 w-16 rounded-full bg-[#a64d23] border-4 border-white text-white shadow-2xl flex items-center justify-center hover:scale-105 transition"
          title="Mở trợ lý chatbot"
        >
          <span className="chatbot-pulse-ring"></span>
          <FaRobot className="text-2xl relative z-10" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-[9999] w-[min(420px,calc(100vw-24px))] h-[640px] max-h-[calc(100vh-48px)] rounded-3xl bg-[#F7F3EC] shadow-2xl border border-white/80 overflow-hidden flex flex-col">
          <ChatHeader onClose={() => setOpen(false)} />

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onSuggestionClick={handleSuggestionClick}
              />
            ))}

            {loading && <TypingIndicator />}

            <div ref={bottomRef} />
          </div>

          <ChatInput
            input={input}
            setInput={setInput}
            loading={loading}
            onSend={() => sendMessage()}
          />
        </div>
      )}
    </>
  );
}

function ChatHeader({ onClose }) {
  return (
    <div className="bg-[#db8250] text-white px-5 py-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-[#9e6f5b] flex items-center justify-center">
          <FaRobot className="text-xl text-[#ffffff]" />
        </div>

        <div>
          <h3 className="font-bold text-lg">Trợ lý Cozygo</h3>
          <p className="text-xs text-white">
             <span className="h-2 w-2 bg-[#28f509] rounded-full inline-block mx-1"></span> Đang hoạt động
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
      >
        <FaTimes />
      </button>
    </div>
  );
}

function ChatMessage({ message, onSuggestionClick }) {
  const isUser = message.sender === "USER";

  return (
    <div className={`flex items-start gap-2 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-[#9e6f5b] text-white flex items-center justify-center shrink-0">
          <FaRobot />
        </div>
      )}

      <div className={`max-w-[82%] ${isUser ? "order-1" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-line ${
            isUser
              ? "bg-[#db8250] text-white rounded-tr-sm"
              : "bg-white text-black border border-gray-200 rounded-tl-sm"
          }`}
        >
          {message.text}
        </div>

        {!isUser && (
          <ChatbotRichData
            dataType={message.dataType}
            data={message.data}
          />
        )}

        {!isUser && message.suggestions?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionClick(suggestion)}
                className="rounded-full bg-[#F4F1EA] border border-gray-200 px-3 py-1.5 text-xs font-bold text-[#2C3E2B] hover:bg-[#e9e0d5] transition"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
          <FaUser />
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <div className="h-8 w-8 rounded-full bg-[#9e6f5b] text-white flex items-center justify-center shrink-0">
        <FaRobot />
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-500 shadow-sm">Đang suy nghĩ...</div>
    </div>
  );
}

function ChatInput({ input, setInput, loading, onSend }) {
  return (
    <div className="border-t border-gray-200 bg-white p-3 shrink-0">
      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSend();
            }
          }}
          placeholder="Nhập câu hỏi của bạn..."
          className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#704a39]"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={loading || !input.trim()}
          className="h-12 w-12 rounded-2xl bg-[#9e6f5b] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}