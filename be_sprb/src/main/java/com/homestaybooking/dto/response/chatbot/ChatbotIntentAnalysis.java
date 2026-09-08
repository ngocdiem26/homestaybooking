package com.homestaybooking.dto.response.chatbot;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ChatbotIntentAnalysis {
    private String primaryIntent = "UNKNOWN";
    private List<String> secondaryIntents = new ArrayList<>();
    private Double confidence = 0.0;
    private Entities entities = new Entities();
    private Clarification clarification = new Clarification();
    private String reasoningSummary;

    public String getPrimaryIntent() { return primaryIntent; }
    public void setPrimaryIntent(String primaryIntent) { this.primaryIntent = primaryIntent == null || primaryIntent.isBlank() ? "UNKNOWN" : primaryIntent; }
    public List<String> getSecondaryIntents() { return secondaryIntents; }
    public void setSecondaryIntents(List<String> secondaryIntents) { this.secondaryIntents = secondaryIntents == null ? new ArrayList<>() : secondaryIntents; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence == null ? 0.0 : confidence; }
    public Entities getEntities() { return entities; }
    public void setEntities(Entities entities) { this.entities = entities == null ? new Entities() : entities; }
    public Clarification getClarification() { return clarification; }
    public void setClarification(Clarification clarification) { this.clarification = clarification == null ? new Clarification() : clarification; }
    public String getReasoningSummary() { return reasoningSummary; }
    public void setReasoningSummary(String reasoningSummary) { this.reasoningSummary = reasoningSummary; }

    public static class Entities {
        private String city;
        private String province;
        private String destinationKeyword;
        private String checkIn;
        private String checkOut;
        private Integer durationDays;
        private Integer guests;
        private Integer adults;
        private Integer children;
        private Boolean familyTrip = false;
        private String groupType = "UNKNOWN";
        private String travelStyle = "UNKNOWN";
        private String pace = "MEDIUM";
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private BigDecimal pricePerNight;
        private List<String> amenities = new ArrayList<>();
        private List<String> services = new ArrayList<>();
        private String activityKeyword;
        private String homestayName;
        private String promotionCode;
        private BigDecimal ratingMin;
        private List<String> preferenceKeywords = new ArrayList<>();
        private String viewPreference;
        private Boolean needNearbyActivities = false;
        private Boolean needHomestaySuggestion = false;
        private Boolean needItinerary = false;
        private Boolean needAvailability = false;
        private String sortBy = "RELEVANCE";

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getProvince() { return province; }
        public void setProvince(String province) { this.province = province; }
        public String getDestinationKeyword() { return destinationKeyword; }
        public void setDestinationKeyword(String destinationKeyword) { this.destinationKeyword = destinationKeyword; }
        public String getCheckIn() { return checkIn; }
        public void setCheckIn(String checkIn) { this.checkIn = checkIn; }
        public String getCheckOut() { return checkOut; }
        public void setCheckOut(String checkOut) { this.checkOut = checkOut; }
        public Integer getDurationDays() { return durationDays; }
        public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }
        public Integer getGuests() { return guests; }
        public void setGuests(Integer guests) { this.guests = guests; }
        public Integer getAdults() { return adults; }
        public void setAdults(Integer adults) { this.adults = adults; }
        public Integer getChildren() { return children; }
        public void setChildren(Integer children) { this.children = children; }
        public Boolean getFamilyTrip() { return familyTrip; }
        public void setFamilyTrip(Boolean familyTrip) { this.familyTrip = Boolean.TRUE.equals(familyTrip); }
        public String getGroupType() { return groupType; }
        public void setGroupType(String groupType) { this.groupType = groupType == null || groupType.isBlank() ? "UNKNOWN" : groupType; }
        public String getTravelStyle() { return travelStyle; }
        public void setTravelStyle(String travelStyle) { this.travelStyle = travelStyle == null || travelStyle.isBlank() ? "UNKNOWN" : travelStyle; }
        public String getPace() { return pace; }
        public void setPace(String pace) { this.pace = pace == null || pace.isBlank() ? "MEDIUM" : pace; }
        public BigDecimal getMinPrice() { return minPrice; }
        public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }
        public BigDecimal getMaxPrice() { return maxPrice; }
        public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }
        public BigDecimal getPricePerNight() { return pricePerNight; }
        public void setPricePerNight(BigDecimal pricePerNight) { this.pricePerNight = pricePerNight; }
        public List<String> getAmenities() { return amenities; }
        public void setAmenities(List<String> amenities) { this.amenities = amenities == null ? new ArrayList<>() : amenities; }
        public List<String> getServices() { return services; }
        public void setServices(List<String> services) { this.services = services == null ? new ArrayList<>() : services; }
        public String getActivityKeyword() { return activityKeyword; }
        public void setActivityKeyword(String activityKeyword) { this.activityKeyword = activityKeyword; }
        public String getHomestayName() { return homestayName; }
        public void setHomestayName(String homestayName) { this.homestayName = homestayName; }
        public String getPromotionCode() { return promotionCode; }
        public void setPromotionCode(String promotionCode) { this.promotionCode = promotionCode; }
        public BigDecimal getRatingMin() { return ratingMin; }
        public void setRatingMin(BigDecimal ratingMin) { this.ratingMin = ratingMin; }
        public List<String> getPreferenceKeywords() { return preferenceKeywords; }
        public void setPreferenceKeywords(List<String> preferenceKeywords) { this.preferenceKeywords = preferenceKeywords == null ? new ArrayList<>() : preferenceKeywords; }
        public String getViewPreference() { return viewPreference; }
        public void setViewPreference(String viewPreference) { this.viewPreference = viewPreference; }
        public Boolean getNeedNearbyActivities() { return needNearbyActivities; }
        public void setNeedNearbyActivities(Boolean needNearbyActivities) { this.needNearbyActivities = Boolean.TRUE.equals(needNearbyActivities); }
        public Boolean getNeedHomestaySuggestion() { return needHomestaySuggestion; }
        public void setNeedHomestaySuggestion(Boolean needHomestaySuggestion) { this.needHomestaySuggestion = Boolean.TRUE.equals(needHomestaySuggestion); }
        public Boolean getNeedItinerary() { return needItinerary; }
        public void setNeedItinerary(Boolean needItinerary) { this.needItinerary = Boolean.TRUE.equals(needItinerary); }
        public Boolean getNeedAvailability() { return needAvailability; }
        public void setNeedAvailability(Boolean needAvailability) { this.needAvailability = Boolean.TRUE.equals(needAvailability); }
        public String getSortBy() { return sortBy; }
        public void setSortBy(String sortBy) { this.sortBy = sortBy == null || sortBy.isBlank() ? "RELEVANCE" : sortBy; }
    }

    public static class Clarification {
        private Boolean needAskMore = false;
        private String question;
        private List<String> missingFields = new ArrayList<>();

        public Boolean getNeedAskMore() { return needAskMore; }
        public void setNeedAskMore(Boolean needAskMore) { this.needAskMore = Boolean.TRUE.equals(needAskMore); }
        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public List<String> getMissingFields() { return missingFields; }
        public void setMissingFields(List<String> missingFields) { this.missingFields = missingFields == null ? new ArrayList<>() : missingFields; }
    }
}
