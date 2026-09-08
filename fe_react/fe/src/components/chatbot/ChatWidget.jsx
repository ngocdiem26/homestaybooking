import { useEffect, useMemo, useRef, useState } from "react";
import { FaPaperPlane, FaRobot, FaTimes, FaUser } from "react-icons/fa";

import { useAuth } from "../../hooks/useAuth";
import { chatbotService } from "../../services/chatbotService";
import ChatbotRichData from "./ChatbotRichData";
import "./ChatWidget.css";

const GUEST_TIMELINE_KEY = "cozygo_chatbot_guest_timeline_v2";
const GUEST_SESSION_KEY = "cozygo_chatbot_guest_session_id_v2";
const GUEST_LAST_ACTIVE_KEY = "cozygo_chatbot_guest_last_active_v2";
const LEGACY_HISTORY_KEY = "cozygo_chatbot_history_v1";
const LEGACY_SESSION_KEY = "cozygo_chatbot_session_id";
const GUEST_STORAGE_SANITIZED_KEY = "cozygo_chatbot_guest_storage_sanitized_v4";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const HISTORY_PAGE_SIZE = 5;
const MAX_GUEST_TIMELINE_ITEMS = 180;
const CHATBOT_POSITION_KEY = "cozygo_chatbot_window_position_v1";
const CHATBOT_EDGE_GAP = 12;

const quickSuggestions = [
  "Tìm homestay ở Đà Lạt dưới 1 triệu",
  "Gợi ý hoạt động trải nghiệm ở Cần Thơ",
  "Chính sách hủy phòng thế nào?",
];

function createWelcomeMessage({
  sessionId = null,
  showSuggestions = true,
  createdAt = null,
} = {}) {
  return {
    type: "MESSAGE",
    id: sessionId
      ? `welcome-session-${sessionId}`
      : `welcome-${Date.now()}-${Math.random()}`,
    sessionId,
    sender: "BOT",
    text: "Xin chào! Mình là trợ lý Cozygo. Hôm nay mình có thể giúp bạn tìm homestay, gợi ý hoạt động, xem khuyến mãi hoặc hỗ trợ đặt phòng.",
    dataType: "TEXT",
    data: null,
    suggestions: showSuggestions ? quickSuggestions : [],
    syntheticWelcome: true,
    createdAt,
  };
}

function createSessionDivider({ sessionId = null, startedAt = null, isNew = false } = {}) {
  return {
    type: "SESSION_DIVIDER",
    id: `divider-${sessionId ?? "new"}-${Date.now()}-${Math.random()}`,
    sessionId,
    startedAt: startedAt || new Date().toISOString(),
    isNew,
  };
}

function appendFreshSession(timeline) {
  const current = Array.isArray(timeline) ? timeline : [];
  const last = current[current.length - 1];

  if (last?.type === "MESSAGE" && last.syntheticWelcome) {
    return current;
  }

  return [
    ...current,
    createSessionDivider({ isNew: true }),
    createWelcomeMessage(),
  ];
}

function sanitizeGuestStorageOnce() {
  if (typeof window === "undefined") return;

  try {
    if (window.localStorage.getItem(GUEST_STORAGE_SANITIZED_KEY) === "true") {
      return;
    }

    /*
     * Các phiên bản trước từng có lúc ghi timeline của user đã đăng nhập
     * vào guest storage khi logout. Không thể xác định chính xác item nào
     * là guest thật và item nào thuộc tài khoản, nên xóa một lần để tránh
     * lộ lịch sử giữa các tài khoản.
     */
    [
      GUEST_TIMELINE_KEY,
      GUEST_SESSION_KEY,
      GUEST_LAST_ACTIVE_KEY,
      LEGACY_HISTORY_KEY,
      LEGACY_SESSION_KEY,
    ].forEach((key) => window.localStorage.removeItem(key));

    window.localStorage.setItem(GUEST_STORAGE_SANITIZED_KEY, "true");
  } catch {
    // Nếu localStorage bị khóa, chatbot vẫn hoạt động trong memory.
  }
}

function readGuestState() {
  if (typeof window === "undefined") {
    return {
      sessionId: null,
      timeline: appendFreshSession([]),
      lastActiveAt: null,
    };
  }

  sanitizeGuestStorageOnce();

  try {
    const rawTimeline = window.localStorage.getItem(GUEST_TIMELINE_KEY);
    const parsedTimeline = rawTimeline ? JSON.parse(rawTimeline) : [];
    const timeline = Array.isArray(parsedTimeline) ? parsedTimeline : [];

    const rawSessionId = window.localStorage.getItem(GUEST_SESSION_KEY);
    const numericSessionId = rawSessionId ? Number(rawSessionId) : null;
    const sessionId = Number.isInteger(numericSessionId) && numericSessionId > 0
      ? numericSessionId
      : null;

    const rawLastActive = window.localStorage.getItem(GUEST_LAST_ACTIVE_KEY);
    const lastActiveAt = rawLastActive ? Number(rawLastActive) : null;
    const stillActive = Boolean(
      sessionId &&
      lastActiveAt &&
      Date.now() - lastActiveAt <= SESSION_TIMEOUT_MS
    );

    return {
      sessionId: stillActive ? sessionId : null,
      timeline: stillActive ? timeline : appendFreshSession(timeline),
      lastActiveAt: stillActive ? lastActiveAt : null,
    };
  } catch {
    return {
      sessionId: null,
      timeline: appendFreshSession([]),
      lastActiveAt: null,
    };
  }
}

function saveGuestState(timeline, sessionId, lastActiveAt) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      GUEST_TIMELINE_KEY,
      JSON.stringify((timeline || []).slice(-MAX_GUEST_TIMELINE_ITEMS)),
    );

    if (sessionId) {
      window.localStorage.setItem(GUEST_SESSION_KEY, String(sessionId));
    } else {
      window.localStorage.removeItem(GUEST_SESSION_KEY);
    }

    if (lastActiveAt) {
      window.localStorage.setItem(GUEST_LAST_ACTIVE_KEY, String(lastActiveAt));
    } else {
      window.localStorage.removeItem(GUEST_LAST_ACTIVE_KEY);
    }
  } catch {
    // localStorage có thể bị chặn ở private mode; chatbot vẫn hoạt động trong memory.
  }
}

function flattenHistorySessions(sessions) {
  if (!Array.isArray(sessions)) return [];

  return sessions.flatMap((session) => {
    const sessionId = session.sessionId;
    const messages = Array.isArray(session.messages) ? session.messages : [];

    return [
      createSessionDivider({
        sessionId,
        startedAt: session.startedAt || session.lastActivityAt,
      }),

      /*
       * Lời chào là UI message, không cần lưu vào chat_messages.
       * Khi dựng lại lịch sử từ backend, chèn lại lời chào ở đầu mỗi session
       * để người dùng luôn thấy đầy đủ timeline như lúc bắt đầu trò chuyện.
       *
       * Không hiển thị suggestion ở các session lịch sử để tránh nút gợi ý bị lặp.
       */
      createWelcomeMessage({
        sessionId,
        showSuggestions: false,
        createdAt: session.startedAt || session.lastActivityAt,
      }),

      ...messages.map((message) => ({
        type: "MESSAGE",
        id: `db-${message.messageId}`,
        sessionId,
        sender: message.senderType,
        text: message.messageContent,
        intent: message.intent,
        dataType: message.dataType || "TEXT",
        data: message.data || null,
        suggestions: [],
        createdAt: message.createdAt,
      })),
    ];
  });
}

function readChatbotPosition() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CHATBOT_POSITION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const left = Number(parsed?.left);
    const top = Number(parsed?.top);

    if (!Number.isFinite(left) || !Number.isFinite(top)) {
      return null;
    }

    return { left, top };
  } catch {
    return null;
  }
}

function saveChatbotPosition(position) {
  if (typeof window === "undefined" || !position) return;

  try {
    window.localStorage.setItem(
      CHATBOT_POSITION_KEY,
      JSON.stringify(position),
    );
  } catch {
    // Không ảnh hưởng chức năng chat nếu localStorage bị khóa.
  }
}

function clampChatbotPosition(position, width, height) {
  if (typeof window === "undefined" || !position) return position;

  const maxLeft = Math.max(
    CHATBOT_EDGE_GAP,
    window.innerWidth - width - CHATBOT_EDGE_GAP,
  );
  const maxTop = Math.max(
    CHATBOT_EDGE_GAP,
    window.innerHeight - height - CHATBOT_EDGE_GAP,
  );

  return {
    left: Math.min(Math.max(CHATBOT_EDGE_GAP, position.left), maxLeft),
    top: Math.min(Math.max(CHATBOT_EDGE_GAP, position.top), maxTop),
  };
}

function buildLocalFallbackResponse() {
  return {
    message:
      "Hiện chatbot chưa kết nối được backend hoặc dịch vụ AI. "
      + "Mình không dùng câu trả lời gán cứng để thay cho dữ liệu thật. "
      + "Bạn thử lại sau một chút nhé.",
    intent: "TEMPORARY_UNAVAILABLE",
    dataType: "TEXT",
    suggestions: [],
  };
}

function formatSessionTime(value) {
  if (!value) return "Lịch sử trò chuyện";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Lịch sử trò chuyện";

  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return `Hôm nay, ${time}`;

  return `${date.toLocaleDateString("vi-VN")}, ${time}`;
}

export default function ChatWidget() {
  const auth = useAuth();
  const isAuthenticated = Boolean(auth?.isAuthenticated);
  const authIdentity = auth?.user?.userId || auth?.user?.id || auth?.user?.email || "guest";
  const requestedScopeKey = isAuthenticated
    ? `user:${String(authIdentity)}`
    : "guest";

  const initialGuestState = useMemo(() => readGuestState(), []);
  const [open, setOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [sessionId, setSessionId] = useState(initialGuestState.sessionId);
  const [timeline, setTimeline] = useState(initialGuestState.timeline);
  const [guestLastActiveAt, setGuestLastActiveAt] = useState(initialGuestState.lastActiveAt);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [oldestSessionId, setOldestSessionId] = useState(null);
  const [loadedScopeKey, setLoadedScopeKey] = useState(
    isAuthenticated ? null : "guest",
  );

  const timelineScopeRef = useRef(isAuthenticated ? null : "guest");
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const autoScrollToBottomRef = useRef(true);

  const chatbotWindowRef = useRef(null);
  const dragStateRef = useRef(null);
  const [windowPosition, setWindowPosition] = useState(() =>
    readChatbotPosition(),
  );
  const [draggingWindow, setDraggingWindow] = useState(false);

  const scopeReady = initialized && loadedScopeKey === requestedScopeKey;

  useEffect(() => {
    /*
     * Chỉ lưu localStorage khi timeline hiện tại THỰC SỰ thuộc guest.
     * Trước đây chỉ kiểm tra !isAuthenticated nên ngay lúc logout, React
     * có thể ghi timeline của user vừa đăng xuất vào guest storage trước
     * khi effect tải guest history chạy. Đây là nguyên nhân chính làm lộ
     * lịch sử tài khoản trước sau khi logout.
     */
    if (
      isAuthenticated ||
      !initialized ||
      loadedScopeKey !== "guest" ||
      timelineScopeRef.current !== "guest"
    ) {
      return;
    }

    saveGuestState(timeline, sessionId, guestLastActiveAt);
  }, [
    timeline,
    sessionId,
    guestLastActiveAt,
    isAuthenticated,
    initialized,
    loadedScopeKey,
  ]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const initialize = async () => {
      /*
       * Đánh dấu timeline cũ là không còn thuộc scope hiện tại NGAY trước
       * khi tải dữ liệu mới. Nhờ vậy logout/login/chuyển tài khoản không
       * thể lưu nhầm hoặc hiển thị nháy lịch sử của tài khoản trước.
       */
      timelineScopeRef.current = null;
      setLoadedScopeKey(null);
      setInitialized(false);
      setLoadingHistory(true);
      autoScrollToBottomRef.current = true;

      try {
        if (isAuthenticated) {
          const history = await chatbotService.getHistory({ limit: HISTORY_PAGE_SIZE });
          if (cancelled) return;

          const sessions = Array.isArray(history.sessions) ? history.sessions : [];
          let items = flattenHistorySessions(sessions);

          setHasMoreHistory(Boolean(history.hasMore));
          setOldestSessionId(sessions.length > 0 ? sessions[0].sessionId : null);
          setSessionId(history.currentSessionId || null);

          if (!history.currentSessionId) {
            items = appendFreshSession(items);
          }

          setTimeline(items.length > 0 ? items : appendFreshSession([]));
          timelineScopeRef.current = requestedScopeKey;
          setLoadedScopeKey(requestedScopeKey);
        } else {
          const guestState = readGuestState();
          if (cancelled) return;

          setSessionId(guestState.sessionId);
          setTimeline(guestState.timeline);
          setGuestLastActiveAt(guestState.lastActiveAt);
          setHasMoreHistory(false);
          setOldestSessionId(null);
          timelineScopeRef.current = "guest";
          setLoadedScopeKey("guest");
        }
      } catch (error) {
        console.error("Cannot load chatbot history:", error);
        if (!cancelled) {
          const guestState = readGuestState();
          setSessionId(isAuthenticated ? null : guestState.sessionId);
          setTimeline(
            isAuthenticated
              ? appendFreshSession([])
              : guestState.timeline,
          );
          setHasMoreHistory(false);
          setOldestSessionId(null);
          const fallbackScope = isAuthenticated ? requestedScopeKey : "guest";
          timelineScopeRef.current = fallbackScope;
          setLoadedScopeKey(fallbackScope);
        }
      } finally {
        if (!cancelled) {
          setLoadingHistory(false);
          setInitialized(true);
        }
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [open, isAuthenticated, authIdentity, requestedScopeKey]);

  useEffect(() => {
    if (!open || !scopeReady || !autoScrollToBottomRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [timeline, loading, open, scopeReady]);

  useEffect(() => {
    if (!open || !windowPosition) return;

    const keepInsideViewport = () => {
      const element = chatbotWindowRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      setWindowPosition((current) => {
        if (!current) return current;
        const next = clampChatbotPosition(current, rect.width, rect.height);

        if (
          next.left === current.left &&
          next.top === current.top
        ) {
          return current;
        }

        saveChatbotPosition(next);
        return next;
      });
    };

    keepInsideViewport();
    window.addEventListener("resize", keepInsideViewport);

    return () => {
      window.removeEventListener("resize", keepInsideViewport);
    };
  }, [open, windowPosition]);

  const handleChatHeaderPointerDown = (event) => {
    if (event.button !== 0) return;

    // Không bắt đầu kéo khi người dùng bấm nút đóng hoặc control bên trong header.
    if (event.target.closest("button, a, input, textarea, select")) {
      return;
    }

    const element = chatbotWindowRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();

    dragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };

    setDraggingWindow(true);

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Một số browser có thể không hỗ trợ pointer capture.
    }

    event.preventDefault();
  };

  const handleChatHeaderPointerMove = (event) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const next = clampChatbotPosition(
      {
        left: event.clientX - drag.offsetX,
        top: event.clientY - drag.offsetY,
      },
      drag.width,
      drag.height,
    );

    setWindowPosition(next);
  };

  const finishChatWindowDrag = (event) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragStateRef.current = null;
    setDraggingWindow(false);

    setWindowPosition((current) => {
      if (current) saveChatbotPosition(current);
      return current;
    });

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Bỏ qua.
    }
  };

  const loadOlderHistory = async () => {
    if (
      !isAuthenticated ||
      !scopeReady ||
      loadingHistory ||
      !hasMoreHistory ||
      !oldestSessionId
    ) {
      return;
    }

    const container = scrollRef.current;
    const previousHeight = container?.scrollHeight || 0;
    const previousTop = container?.scrollTop || 0;

    setLoadingHistory(true);
    autoScrollToBottomRef.current = false;

    try {
      const history = await chatbotService.getHistory({
        beforeSessionId: oldestSessionId,
        limit: HISTORY_PAGE_SIZE,
      });

      const sessions = Array.isArray(history.sessions) ? history.sessions : [];
      const olderItems = flattenHistorySessions(sessions);

      if (olderItems.length > 0) {
        setTimeline((current) => [...olderItems, ...current]);
        setOldestSessionId(sessions[0]?.sessionId || oldestSessionId);
      }
      setHasMoreHistory(Boolean(history.hasMore));

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!container) return;
          const addedHeight = container.scrollHeight - previousHeight;
          container.scrollTop = previousTop + addedHeight;
        });
      });
    } catch (error) {
      console.error("Cannot load older chatbot history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleScroll = (event) => {
    if (event.currentTarget.scrollTop <= 70) {
      loadOlderHistory();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion === "Đăng nhập") {
      window.location.assign("/login");
      return;
    }
    sendMessage(suggestion);
  };

  const sendMessage = async (customMessage) => {
    const messageText = (customMessage || input).trim();
    if (!messageText || loading || !scopeReady) return;

    const sessionIdAtSend = sessionId;
    const userMessageId = `${Date.now()}-user`;

    autoScrollToBottomRef.current = true;
    setTimeline((current) => [
      ...current,
      {
        type: "MESSAGE",
        id: userMessageId,
        sessionId: sessionIdAtSend,
        sender: "USER",
        text: messageText,
        dataType: "TEXT",
        data: null,
        suggestions: [],
      },
    ]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage({
        sessionId: sessionIdAtSend,
        message: messageText,
        currentPage: window.location.pathname,
      });

      const responseSessionId = response.sessionId || null;
      setSessionId(responseSessionId);

      if (!isAuthenticated) {
        setGuestLastActiveAt(Date.now());
      }

      setTimeline((current) => {
        let next = current;

        /*
         * Backend có quyền tạo session mới nếu session cũ đã im lặng > 30 phút.
         * Nếu điều đó xảy ra đúng lúc user gửi tin, chèn ranh giới session trước tin nhắn đó.
         */
        if (
          sessionIdAtSend &&
          responseSessionId &&
          sessionIdAtSend !== responseSessionId
        ) {
          const userIndex = next.findIndex((item) => item.id === userMessageId);
          if (userIndex >= 0) {
            next = [
              ...next.slice(0, userIndex),
              createSessionDivider({ sessionId: responseSessionId, isNew: true }),
              createWelcomeMessage(),
              ...next.slice(userIndex),
            ];
          }
        }

        next = next.map((item) =>
          item.id === userMessageId
            ? { ...item, sessionId: responseSessionId }
            : item,
        );

        return [
          ...next,
          {
            type: "MESSAGE",
            id: `${Date.now()}-bot`,
            sessionId: responseSessionId,
            sender: "BOT",
            text: response.message || response.answer || "Xin lỗi, mình chưa có câu trả lời phù hợp.",
            intent: response.intent,
            dataType: response.dataType || "TEXT",
            data: response.data || null,
            suggestions: response.suggestions || [],
          },
        ];
      });
    } catch (error) {
      console.error("Chatbot error:", error);
      const fallback = buildLocalFallbackResponse(messageText);

      if (!isAuthenticated) {
        setGuestLastActiveAt(Date.now());
      }

      setTimeline((current) => [
        ...current,
        {
          type: "MESSAGE",
          id: `${Date.now()}-error`,
          sessionId: sessionIdAtSend,
          sender: "BOT",
          text: fallback.message,
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
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="chatbot-floating-btn fixed bottom-6 right-6 z-[9999] h-16 w-16 rounded-full bg-[#a64d23] border-4 border-white text-white shadow-2xl flex items-center justify-center hover:scale-105 transition"
          title="Mở trợ lý chatbot"
        >
          <span className="chatbot-pulse-ring" />
          <FaRobot className="text-2xl relative z-10" />
        </button>
      )}

      {open && (
        <div
          ref={chatbotWindowRef}
          className={`fixed z-[9999] w-[min(420px,calc(100vw-24px))] h-[640px] max-h-[calc(100vh-48px)] rounded-3xl bg-[#F7F3EC] shadow-2xl border border-white/80 overflow-hidden flex flex-col ${
            windowPosition ? "" : "bottom-6 right-6"
          } ${draggingWindow ? "shadow-[0_24px_70px_rgba(0,0,0,0.28)]" : ""}`}
          style={
            windowPosition
              ? {
                  left: `${windowPosition.left}px`,
                  top: `${windowPosition.top}px`,
                }
              : undefined
          }
        >
          <ChatHeader
            onClose={() => setOpen(false)}
            onPointerDown={handleChatHeaderPointerDown}
            onPointerMove={handleChatHeaderPointerMove}
            onPointerUp={finishChatWindowDrag}
            onPointerCancel={finishChatWindowDrag}
            dragging={draggingWindow}
          />

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          >
            {loadingHistory && scopeReady && (
              <div className="text-center text-xs text-gray-400 py-1">
                Đang tải lịch sử cũ...
              </div>
            )}

            {scopeReady && isAuthenticated && hasMoreHistory && !loadingHistory && (
              <div className="text-center text-xs text-gray-400 py-1">
                Kéo lên để xem thêm lịch sử
              </div>
            )}

            {!scopeReady && (
              <div className="text-center text-sm text-gray-500 py-6">
                Đang tải cuộc trò chuyện...
              </div>
            )}

            {scopeReady && timeline.map((item, index) => (
              item.type === "SESSION_DIVIDER" ? (
                <SessionDivider
                  key={item.id}
                  item={item}
                  showHistoryMarker={
                    Boolean(
                      item.isNew &&
                      timeline
                        .slice(0, index)
                        .some((entry) => entry.type === "SESSION_DIVIDER")
                    )
                  }
                />
              ) : (
                <ChatMessage
                  key={item.id}
                  message={item}
                  onSuggestionClick={handleSuggestionClick}
                />
              )
            ))}

            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          <ChatInput
            input={input}
            setInput={setInput}
            loading={loading || !scopeReady}
            onSend={() => sendMessage()}
          />
        </div>
      )}
    </>
  );
}

function ChatHeader({
  onClose,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  dragging,
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className={`bg-[#db8250] text-white px-5 py-4 flex items-center justify-between shrink-0 select-none touch-none ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      title="Giữ và kéo để di chuyển cửa sổ chatbot"
    >
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-[#9e6f5b] flex items-center justify-center">
          <FaRobot className="text-xl text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Trợ lý Cozygo</h3>
          <p className="text-xs text-white">
            <span className="h-2 w-2 bg-[#28f509] rounded-full inline-block mx-1" />
            Đang hoạt động
          </p>
        </div>
      </div>

      <button
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={onClose}
        className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
        aria-label="Đóng chatbot"
      >
        <FaTimes />
      </button>
    </div>
  );
}

function SessionDivider({ item, showHistoryMarker = false }) {
  const dateLabel = formatSessionTime(item.startedAt);

  return (
    <div className="py-1" aria-label={dateLabel}>
      {showHistoryMarker && (
        <div className="mb-4 flex items-center gap-3 px-1">
          <div className="h-px flex-1 bg-[#D9DDE3]" />
          <span className="whitespace-nowrap text-[11px] font-normal text-[#8C919A]">
            Lịch sử trò chuyện được hiển thị ở trên
          </span>
          <div className="h-px flex-1 bg-[#D9DDE3]" />
        </div>
      )}

      <div className="text-center">
        <span className="text-[11px] font-normal text-[#8C919A]">
          {dateLabel}
        </span>
      </div>
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

        {!isUser && <ChatbotRichData dataType={message.dataType} data={message.data} />}

        {!isUser && message.suggestions?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionClick(suggestion)}
                className="rounded-full border border-[#E9CFBF] bg-[#FFF1E7] px-3 py-1.5 text-xs font-semibold text-[#5E463A] shadow-[0_1px_2px_rgba(112,74,57,0.05)] transition-colors hover:border-[#DDB89F] hover:bg-[#FBE3D4]"
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
      <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-500 shadow-sm">
        Đang suy nghĩ...
      </div>
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
            if (event.key === "Enter") onSend();
          }}
          placeholder="Nhập câu hỏi của bạn..."
          className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#704a39]"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={loading || !input.trim()}
          className="h-12 w-12 rounded-2xl bg-[#9e6f5b] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Gửi tin nhắn"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}
