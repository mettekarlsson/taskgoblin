package com.example.taskgoblin.dto;

import java.time.LocalDateTime;


//is used in calendar-view
public class EventSummaryDTO {

        private final Long id;
        private String title;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Boolean isAllDay;
        private String color; // from category, to use in calendar

    public EventSummaryDTO(Long id, String title, LocalDateTime startTime, LocalDateTime endTime, Boolean isAllDay, String color) {
        this.id = id;
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isAllDay = isAllDay;
        this.color = color;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public Boolean getAllDay() {
        return isAllDay;
    }

    public void setAllDay(Boolean allDay) {
        isAllDay = allDay;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
