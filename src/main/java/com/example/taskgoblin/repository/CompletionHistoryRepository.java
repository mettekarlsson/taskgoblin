package com.example.taskgoblin.repository;

import com.example.taskgoblin.model.CompletionHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompletionHistoryRepository
        extends JpaRepository<CompletionHistory, Long> {

    void deleteByUserId(Long userId);
}