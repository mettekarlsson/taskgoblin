package com.example.taskgoblin.dto;

import java.time.LocalDateTime;

public class UpdateDueDateDTO {

    private LocalDateTime dueAt;

    public UpdateDueDateDTO() {
    }

    public LocalDateTime getDueAt() {
        return dueAt;
    }

    public void setDueAt(LocalDateTime dueAt) {
        this.dueAt = dueAt;
    }
}
