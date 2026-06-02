package com.example.taskgoblin.dto;

import com.example.taskgoblin.model.Frequency;


import java.time.LocalDateTime;

public class TaskListDTO {

    private Long id;
    private Long categoryId;
    private String name;
    private String color;
    private String icon;
    private LocalDateTime dueAt;
    private Boolean pinned;
    private Boolean isRecurring;
    private Frequency frequency;
    private Integer intervalValue;
    private LocalDateTime createdAt;
    private LocalDateTime lastInteractedAt;


    public TaskListDTO() {
    }

    public TaskListDTO(Long id, Long categoryId, String name, String color, String icon, LocalDateTime dueAt, Boolean pinned, Boolean isRecurring, Frequency frequency, Integer intervalValue, LocalDateTime createdAt, LocalDateTime lastInteractedAt) {
        this.id = id;
        this.categoryId = categoryId;
        this.name = name;
        this.color = color;
        this.icon = icon;
        this.dueAt = dueAt;
        this.pinned = pinned;
        this.isRecurring = isRecurring;
        this.frequency = frequency;
        this.intervalValue = intervalValue;
        this.createdAt = createdAt;
        this.lastInteractedAt = lastInteractedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getName() {
        return name;
    }

    public String getColor() {
        return color;
    }

    public String getIcon() {
        return icon;
    }

    public LocalDateTime getDueAt() {
        return dueAt;
    }

    public Boolean getPinned() {
        return pinned;
    }

    public Boolean getIsRecurring() {
        return isRecurring;
    }

    public Frequency getFrequency() {
        return frequency;
    }

    public Integer getIntervalValue() {
        return intervalValue;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getLastInteractedAt() {
        return lastInteractedAt;
    }
}
