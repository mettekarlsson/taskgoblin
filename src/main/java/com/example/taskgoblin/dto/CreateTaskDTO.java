package com.example.taskgoblin.dto;

import com.example.taskgoblin.model.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/*
 Validation annotations check that incoming data is valid
 before it reaches the service layer.
*/

public class CreateTaskDTO {

    @NotBlank(message = "Task title cannot be empty.")
    @Size(max = 200, message = "Task title cannot be longer than 200 characters.")
    private String title;

    // Optional due date for the task
    private LocalDateTime dueAt;

    // Optional priority level
    private Priority priority;

    // Determines if the task should repeat
    private Boolean isRecurring;

    public CreateTaskDTO() {
    }

    public CreateTaskDTO(String title, LocalDateTime dueAt, Priority priority, Boolean isRecurring) {
        this.title = title;
        this.dueAt = dueAt;
        this.priority = priority;
        this.isRecurring = isRecurring;

    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }


    public LocalDateTime getDueAt() {
        return dueAt;
    }

    public void setDueAt(LocalDateTime dueAt) {
        this.dueAt = dueAt;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public Boolean getIsRecurring() {
        return isRecurring;
    }

    public void setIsRecurring(Boolean recurring) {
        isRecurring = recurring;
    }
}
