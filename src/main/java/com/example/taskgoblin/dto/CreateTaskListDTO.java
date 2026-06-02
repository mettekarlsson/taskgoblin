package com.example.taskgoblin.dto;

import com.example.taskgoblin.model.Frequency;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public class CreateTaskListDTO {

//    private Long categoryId;
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

    public CreateTaskListDTO(LocalDateTime dueAt, String icon, String color, String name) {
        this.dueAt = dueAt;
        this.icon = icon;
        this.color = color;
        this.name = name;
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
}

