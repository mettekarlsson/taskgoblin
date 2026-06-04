package com.example.taskgoblin.dto;

import com.example.taskgoblin.model.Frequency;
import com.example.taskgoblin.model.TaskListStatus;


import java.time.LocalDateTime;

public class TaskListDTO {

    private Long id;
    private Long categoryId;
    private String name;
    private String color;
    private String icon;
    private LocalDateTime dueAt;
    private boolean pinned;
    private boolean isRecurring;
    private Frequency frequency;
    private Integer intervalValue;
    private LocalDateTime createdAt;
    private LocalDateTime lastInteractedAt;
    private TaskListStatus status;
    private LocalDateTime completedAt;
    private LocalDateTime lastCompletedAt;


    public TaskListDTO() {
    }

    public TaskListDTO(
            Long id,
            Long categoryId,
            String name,
            String color,
            String icon,
            LocalDateTime dueAt,
            boolean pinned,
            boolean isRecurring,
            Frequency frequency,
            Integer intervalValue,
            LocalDateTime createdAt,
            LocalDateTime lastInteractedAt,
            TaskListStatus status,
            LocalDateTime completedAt,
            LocalDateTime lastCompletedAt
            ) {


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
        this.status = status;
        this.completedAt = completedAt;
        this.lastCompletedAt = lastCompletedAt;
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

    public boolean getPinned() {
        return pinned;
    }

    public boolean getIsRecurring() {
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

    public TaskListStatus getStatus() {
        return status;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public LocalDateTime getLastCompletedAt() {
        return lastCompletedAt;
    }
}
