package com.example.taskgoblin.dto;

import com.example.taskgoblin.model.Category;
import com.example.taskgoblin.model.Frequency;
import java.time.LocalDateTime;

public class EventDTO {

    //final pga ingen set-er
    private final Long id;

    private Category category;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String location;
    private Boolean isAllDay;
    private Boolean isRecurring;
    private Frequency frequency;
    private Integer intervalValue;

    public EventDTO(Long id, Category category, String title, String description, LocalDateTime startTime, LocalDateTime endTime, String location, Boolean isAllDay, Boolean isRecurring, Frequency frequency, Integer intervalValue) {
        this.id = id;
        this.category = category;
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.isAllDay = isAllDay;
        this.isRecurring = isRecurring;
        this.frequency = frequency;
        this.intervalValue = intervalValue;
    }

    public Long getId() {
        return id;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
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

    public void setAllDay(Boolean allDay) {
        isAllDay = allDay;
    }

    public Boolean getRecurring() {
        return isRecurring;
    }

    public void setRecurring(Boolean recurring) {
        isRecurring = recurring;
    }

    public Frequency getFrequency() {
        return frequency;
    }

    public void setFrequency(Frequency frequency) {
        this.frequency = frequency;
    }

    public Integer getIntervalValue() {
        return intervalValue;
    }

    public void setIntervalValue(Integer intervalValue) {
        this.intervalValue = intervalValue;
    }
}
