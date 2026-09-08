package com.homestaybooking.dto.response.chatbot;

import java.util.ArrayList;
import java.util.List;

public class ChatbotRetrievalResult {
    private String dataType = "TEXT";
    private Object data;
    private String contextText = "";
    private List<String> suggestions = new ArrayList<>();

    public ChatbotRetrievalResult() {
    }

    public ChatbotRetrievalResult(String dataType, Object data, String contextText, List<String> suggestions) {
        this.dataType = dataType == null || dataType.isBlank() ? "TEXT" : dataType;
        this.data = data;
        this.contextText = contextText == null ? "" : contextText;
        this.suggestions = suggestions == null ? new ArrayList<>() : suggestions;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType == null || dataType.isBlank() ? "TEXT" : dataType;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public String getContextText() {
        return contextText;
    }

    public void setContextText(String contextText) {
        this.contextText = contextText == null ? "" : contextText;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions == null ? new ArrayList<>() : suggestions;
    }
}
