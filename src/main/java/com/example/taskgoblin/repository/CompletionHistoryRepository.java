package com.example.taskgoblin.repository;

import com.example.taskgoblin.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompletionHistoryRepository extends JpaRepository<Note, Long> {
    void deleteByUserId(Long userId);
}
