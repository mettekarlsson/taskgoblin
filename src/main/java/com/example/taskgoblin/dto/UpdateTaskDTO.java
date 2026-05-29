package com.example.taskgoblin.dto;

import com.example.taskgoblin.model.Frequency;
import com.example.taskgoblin.model.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class UpdateTaskDTO {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    private LocalDateTime dueAt;

    private Priority priority;

    private Long categoryId;

    private Long taskListId;

    private Integer sortOrder;

    @NotNull(message = "Recurring flag is required")
    private Boolean isRecurring;

    private Frequency frequency;

    private Integer intervalValue;
}