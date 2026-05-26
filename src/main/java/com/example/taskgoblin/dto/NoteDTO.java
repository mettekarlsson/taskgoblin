package com.example.taskgoblin.dto;


import java.time.LocalDateTime;

public class NoteDTO {
    private Long id;

    private String title;

    private String content;

    private String color;

    private Boolean pinned;

    private LocalDateTime createdAt;

    private LocalDateTime lastInteractedAt;

    public NoteDTO(Long id, String title, String content, String color, Boolean pinned, LocalDateTime createdAt, LocalDateTime lastInteractedAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.color = color;
        this.pinned = pinned;
        this.createdAt = createdAt;
        this.lastInteractedAt = lastInteractedAt;
    }

    public Long getId() { return id; }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Boolean getPinned() {
        return pinned;
    }

    public void setPinned(Boolean pinned) {
        this.pinned = pinned;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastInteractedAt() {
        return lastInteractedAt;
    }

    public void setLastInteractedAt(LocalDateTime lastInteractedAt) {
        this.lastInteractedAt = lastInteractedAt;
    }
}


