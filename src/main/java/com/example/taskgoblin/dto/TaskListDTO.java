package com.example.taskgoblin.dto;

import java.time.LocalDateTime;

public class TaskListDTO {

    // Initial DTO for task list responses.
    // Additional fields may be added as list functionality expands.

    private Long id;
    private String name;
    private String color;
    private String icon;
    private Boolean pinned;
    private LocalDateTime dueAt;


    public TaskListDTO() {
    }

    public TaskListDTO(Long id, String name, String color, String icon, Boolean pinned, LocalDateTime dueAt) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.icon = icon;
        this.pinned = pinned;
        this.dueAt = dueAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
