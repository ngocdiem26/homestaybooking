package com.homestaybooking.service;

import com.homestaybooking.entity.ItineraryItem;
import com.homestaybooking.service.ItineraryValidationService.ActivitySchedule;
import com.homestaybooking.service.ItineraryValidationService.ValidationResult;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ItineraryValidationServiceTest {

    private final ItineraryValidationService validator = new ItineraryValidationService(null);
    private final Map<Integer, ActivitySchedule> activities = Map.of(
            1, new ActivitySchedule(
                    1,
                    "Bat ca ruong mien Tay",
                    LocalTime.of(7, 0),
                    LocalTime.of(17, 0),
                    180,
                    "MORNING",
                    "MEDIUM",
                    "Can Tho",
                    "Can Tho"
            )
    );

    @Test
    void systemActivityInsideOpeningHoursIsValid() {
        ItineraryItem item = systemActivity(LocalTime.of(8, 0));

        ValidationResult result = validator.validate(List.of(item), activities, 1);

        assertTrue(result.valid());
        assertEquals(LocalTime.of(11, 0), item.getEndTime());
        assertEquals(180, item.getDurationMinutes());
    }

    @Test
    void systemActivityAtNightIsInvalid() {
        ItineraryItem item = systemActivity(LocalTime.of(19, 0));

        ValidationResult result = validator.validate(List.of(item), activities, 1);

        assertFalse(result.valid());
        assertTrue(hasReason(result, "ngoai gio mo cua"));
    }

    @Test
    void systemActivityStartingTooLateForRecommendedDurationIsInvalid() {
        ItineraryItem item = systemActivity(LocalTime.of(16, 0));

        ValidationResult result = validator.validate(List.of(item), activities, 1);

        assertFalse(result.valid());
        assertEquals(LocalTime.of(19, 0), item.getEndTime());
        assertTrue(hasReason(result, "ngoai gio mo cua"));
    }

    @Test
    void systemActivityEndingExactlyAtClosingTimeIsValid() {
        ItineraryItem item = systemActivity(LocalTime.of(14, 0));

        ValidationResult result = validator.validate(List.of(item), activities, 1);

        assertTrue(result.valid());
        assertEquals(LocalTime.of(17, 0), item.getEndTime());
    }

    @Test
    void overlappingItemsAreInvalid() {
        ItineraryItem first = customItem("Cho noi", LocalTime.of(9, 0), LocalTime.of(10, 0), false);
        ItineraryItem second = customItem("Quan ca phe", LocalTime.of(9, 30), LocalTime.of(10, 30), false);

        ValidationResult result = validator.validate(List.of(first, second), activities, 1);

        assertFalse(result.valid());
        assertTrue(hasReason(result, "chong thoi gian"));
    }

    @Test
    void fixedUserCustomTimeIsNotChanged() {
        ItineraryItem fixed = customItem("Dia diem rieng", LocalTime.of(10, 0), LocalTime.of(11, 0), true);
        LocalTime originalStart = fixed.getStartTime();
        LocalTime originalEnd = fixed.getEndTime();

        ValidationResult result = validator.validate(List.of(fixed), activities, 1);

        assertTrue(result.valid());
        assertEquals(originalStart, fixed.getStartTime());
        assertEquals(originalEnd, fixed.getEndTime());
    }


    @Test
    void lunchAtMidnightIsInvalid() {
        ItineraryItem lunch = customItem("Lunch", LocalTime.of(23, 15), LocalTime.of(0, 15), false);
        lunch.setItemType("MEAL");

        ValidationResult result = validator.validate(List.of(lunch), activities, 1);

        assertFalse(result.valid());
        assertTrue(hasReason(result, "Bua trua"));
    }

    @Test
    void itemAfterReasonableDayEndIsInvalid() {
        ItineraryItem freeTime = customItem("Free Time", LocalTime.of(20, 45), LocalTime.of(23, 0), false);
        freeTime.setItemType("FREE_TIME");
        freeTime.setSourceType("FREE_TIME");

        ValidationResult result = validator.validate(List.of(freeTime), activities, 1);

        assertFalse(result.valid());
        assertTrue(hasReason(result, "Khung gio khong hop ly"));
    }
    private ItineraryItem systemActivity(LocalTime startTime) {
        return ItineraryItem.builder()
                .dayNumber(1)
                .displayOrder(1)
                .startTime(startTime)
                .title("Bat ca ruong mien Tay")
                .itemType("ACTIVITY")
                .sourceType("SYSTEM_ACTIVITY")
                .activityId(1)
                .sourceId(1L)
                .fixedTime(false)
                .build();
    }

    private ItineraryItem customItem(String title, LocalTime startTime, LocalTime endTime, boolean fixedTime) {
        return ItineraryItem.builder()
                .dayNumber(1)
                .displayOrder(1)
                .startTime(startTime)
                .endTime(endTime)
                .durationMinutes(60)
                .title(title)
                .itemType("CUSTOM")
                .sourceType("USER_CUSTOM")
                .fixedTime(fixedTime)
                .build();
    }

    private boolean hasReason(ValidationResult result, String expected) {
        return result.violations().stream()
                .anyMatch(violation -> violation.reason() != null && violation.reason().contains(expected));
    }
}