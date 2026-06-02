package com.example.taskgoblin.dto;

import com.example.taskgoblin.model.Frequency;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public class CreateTaskListDTO {


    private Long categoryId;
    private String name;
    private String color;
    private String icon;
    private LocalDateTime dueAt;
    private Boolean isRecurring;
    private Frequency frequency;
    @Positive(message = "Interval value must be greater than 0.")
    private Integer intervalValue;


    public CreateTaskListDTO() {
    }

    public CreateTaskListDTO(Long categoryId, String name, String color, String icon, LocalDateTime dueAt, Boolean isRecurring, Frequency frequency, Integer intervalValue) {
        this.categoryId = categoryId;
        this.name = name;
        this.color = color;
        this.icon = icon;
        this.dueAt = dueAt;
        this.isRecurring = isRecurring;
        this.frequency = frequency;
        this.intervalValue = intervalValue;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public LocalDateTime getDueAt() {
        return dueAt;
    }

    public void setDueAt(LocalDateTime dueAt) {
        this.dueAt = dueAt;
    }

    public Boolean getIsRecurring() {
        return isRecurring;
    }

    public void setIsRecurring(Boolean recurring) {
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

