package com.homestaybooking.exception;

import com.homestaybooking.dto.response.ItineraryValidationViolation;

import java.util.List;

public class ItineraryGenerationException extends RuntimeException {
    private final String code;
    private final String reason;
    private final List<ItineraryValidationViolation> violations;

    public ItineraryGenerationException(String code, String reason) {
        this(code, reason, List.of());
    }

    public ItineraryGenerationException(String code, String reason, List<ItineraryValidationViolation> violations) {
        super(reason);
        this.code = code;
        this.reason = reason;
        this.violations = violations == null ? List.of() : List.copyOf(violations);
    }

    public String getCode() {
        return code;
    }

    public String getReason() {
        return reason;
    }

    public List<ItineraryValidationViolation> getViolations() {
        return violations;
    }
}