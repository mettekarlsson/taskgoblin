package com.example.taskgoblin.dto;

public class TaskListProgressDTO {

    private int totalTasks;
    private int completedTasks;
    private int progressPercentage;

    public TaskListProgressDTO(
            int totalTasks,
            int completedTasks,
            int progressPercentage
    ) {
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.progressPercentage = progressPercentage;
    }

    public int getTotalTasks() {
        return totalTasks;
    }

    public int getCompletedTasks() {
        return completedTasks;
    }

    public int getProgressPercentage() {
        return progressPercentage;
    }
}
