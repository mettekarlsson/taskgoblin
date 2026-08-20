package com.example.taskgoblin.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "completion_history")
public class CompletionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "task_id")
    private Task task;

    @ManyToOne
    @JoinColumn(name = "list_id")
    private TaskList list;

    @Column(nullable = false)
    private LocalDateTime completedAt;

    @Column(name = "previous_due_at")
    private LocalDateTime previousDueAt;

    public CompletionHistory() {
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public TaskList getList() {
        return list;
    }

    public void setList(TaskList list) {
        this.list = list;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getPreviousDueAt() {
        return previousDueAt;
    }

    public void setPreviousDueAt(LocalDateTime previousDueAt) {
        this.previousDueAt = previousDueAt;
    }
}