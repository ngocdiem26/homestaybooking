package com.homestaybooking.service;

import java.util.Locale;
import java.util.Set;

public final class RevenueStatus {
    public static final String PENDING = "PENDING";
    public static final String RECOGNIZED = "RECOGNIZED";
    public static final String CANCELLED = "CANCELLED";
    public static final String PAID_OUT = "PAID_OUT";
    public static final String NONE = "NONE";
    public static final String REFUNDED = "REFUNDED";
    public static final String PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED";
    public static final String FAILED = "FAILED";
    public static final String FREE_CANCELLATION = "FREE_CANCELLATION";
    public static final String LATE_CANCELLATION = "LATE_CANCELLATION";
    public static final String HOST_CANCELLATION = "HOST_CANCELLATION";
    public static final String NO_SHOW = "NO_SHOW";
    public static final String PAID = "PAID";
    public static final String OVERDUE = "OVERDUE";
    public static final String WAIVED = "WAIVED";
    public static final String ACTIVE = "ACTIVE";
    public static final String TRIAL = "TRIAL";
    public static final String SUSPENDED = "SUSPENDED";

    private RevenueStatus() {}

    public static String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    public static boolean revenueStatus(String value) {
        return Set.of(RECOGNIZED, PAID_OUT).contains(normalize(value));
    }
}
