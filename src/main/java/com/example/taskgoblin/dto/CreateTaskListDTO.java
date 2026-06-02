package com.example.taskgoblin.dto;

import java.time.LocalDateTime;

public class CreateTaskListDTO {

    private String name;
    private String color;
    private String icon;
    private Boolean pinned;
    private LocalDateTime dueAt;


    public CreateTaskListDTO() {
    }

    public CreateTaskListDTO(LocalDateTime dueAt, Boolean pinned, String icon, String color, String name) {
        this.dueAt = dueAt;
        this.pinned = pinned;
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

    public Boolean getPinned() {
        return pinned;
    }

    public void setPinned(Boolean pinned) {
        this.pinned = pinned;
    }

    public LocalDateTime getDueAt() {
        return dueAt;
    }

    public void setDueAt(LocalDateTime dueAt) {
        this.dueAt = dueAt;
    }
}

