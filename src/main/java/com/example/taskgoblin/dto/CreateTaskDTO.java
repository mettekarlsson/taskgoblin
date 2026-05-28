package com.example.taskgoblin.dto;

import com.example.taskgoblin.model.Frequency;
import com.example.taskgoblin.model.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Positive;

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

    // Id of the list the task belongs to
    private Long listId;

    // Id of the category connected to the task
    private Long categoryId;

    // How often a recurring task repeats
    private Frequency frequency;

    // Example:
    // every 2 days / every 3 weeks
    @Positive(message = "Interval value must be greater than 0.")
    private Integer intervalValue;


    public CreateTaskDTO() {
    }

    public CreateTaskDTO(String title,
                         LocalDateTime dueAt,
                         Priority priority,
                         Boolean isRecurring,
                         Long listId,
                         Long categoryId,
                         Frequency frequency,
                         Integer intervalValue
    ) {
        this.title = title;
        this.dueAt = dueAt;
        this.priority = priority;
        this.isRecurring = isRecurring;
        this.listId = listId;
        this.categoryId = categoryId;
        this.frequency = frequency;
        this.intervalValue = intervalValue;

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

    public Long getListId() { return listId; }

    public void setListId(Long listId) { this.listId = listId; }

    public Long getCategoryId() { return categoryId; }

    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public Frequency getFrequency() { return frequency; }

    public void setFrequency(Frequency frequency) { this.frequency = frequency; }

    public Integer getIntervalValue() { return intervalValue; }

    public void setIntervalValue(Integer intervalValue) { this.intervalValue = intervalValue; }
}
