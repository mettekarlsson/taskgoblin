package com.example.taskgoblin.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class UpdateEventDTO {

    private Long categoryId;
    //Medvetet ingen @NotBlank/@NotNull, eftersom detta är en PATCH:
    // null betyder "detta fält ska inte ändras".
    // @Size validerar bara formatet om värdet skickas med, utan att tvinga fram ett värde.
    // (Bean Validation låter null passera @Size automatiskt.)
    @Size(max = 200, message = "Title cannot be longer than 200 characters.")
    private String title;

    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Size(max = 255, message = "Location cannot exceed 255 characters")
    private String location;
    private Boolean isAllDay;
    private Boolean isRecurring;
    private String frequency;
    private Integer intervalValue;

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Boolean getIsAllDay() {
        return isAllDay;
    }

    public void setIsAllDay(Boolean allDay) {
        isAllDay = allDay;
    }

    public Boolean getIsRecurring() {
        return isRecurring;
    }

    public void setIsRecurring(Boolean recurring) {
        isRecurring = recurring;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public Integer getIntervalValue() {
        return intervalValue;
    }

    public void setIntervalValue(Integer intervalValue) {
        this.intervalValue = intervalValue;
    }
}