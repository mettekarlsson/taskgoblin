package com.example.taskgoblin.dto;

import com.example.taskgoblin.model.Frequency;
import com.example.taskgoblin.model.Priority;
import com.example.taskgoblin.model.TaskStatus;

import java.time.LocalDateTime;

/*
 DTO used when sending task data back to the client.

 Unlike CreateTaskDTO, this DTO contains
 system-generated fields such as id, status
 and timestamps.
*/

public class TaskDTO {

    private Long id;

    private String title;

    private LocalDateTime dueAt;

    private Priority priority;

    private TaskStatus status;

    private Boolean isRecurring;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime completedAt;

    private Long listId;

    private Long categoryId;

    private Frequency frequency;

    private Integer intervalValue;


    public TaskDTO() {
    }

    public TaskDTO(
            Long id,
            String title,
            LocalDateTime dueAt,
            Priority priority,
            TaskStatus status,
            Boolean isRecurring,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime completedAt,
            Long listId,
            Long categoryId,
            Frequency frequency,
            Integer intervalValue
    ) {
        this.id = id;
        this.title = title;
        this.dueAt = dueAt;
        this.priority = priority;
        this.status = status;
        this.isRecurring = isRecurring;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.completedAt = completedAt;
        this.listId = listId;
        this.categoryId = categoryId;
        this.frequency = frequency;
        this.intervalValue = intervalValue;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public LocalDateTime getDueAt() {
        return dueAt;
    }

    public Priority getPriority() {
        return priority;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public Boolean getIsRecurring() {
        return isRecurring;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public Long getListId() { return listId; }

    public Long getCategoryId() { return categoryId; }

    public Frequency getFrequency() { return frequency; }

    public Integer getIntervalValue() { return intervalValue; }


}
