import { apiRequest } from "../api/axiosClient";
import { CHATBOT_ENDPOINTS } from "../api/endpoints";

export const chatbotService = {
  sendMessage: async ({ sessionId, message, currentPage }) => {
    return apiRequest(CHATBOT_ENDPOINTS.MESSAGE, {
      method: "POST",
      body: {
        sessionId,
        message,
        currentPage,
      },
    });
  },

  getHistory: async ({ beforeSessionId = null, limit = 5 } = {}) => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    if (beforeSessionId) {
      params.set("beforeSessionId", String(beforeSessionId));
    }

    return apiRequest(`${CHATBOT_ENDPOINTS.HISTORY}?${params.toString()}`, {
      method: "GET",
    });
  },
};
