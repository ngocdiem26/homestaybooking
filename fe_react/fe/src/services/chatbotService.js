// import axios from "axios";

// const API_BASE_URL = "http://localhost:8080/api/public/chatbot";

// export const chatbotService = {
//   sendMessage: async ({ sessionId, message, currentPage }) => {
//     const response = await axios.post(`${API_BASE_URL}/message`, {
//       sessionId,
//       message,
//       currentPage,
//     });

//     return response.data;
//   },
// };
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

  reindex: async () => {
    return apiRequest(CHATBOT_ENDPOINTS.REINDEX, {
      method: "POST",
    });
  },
};