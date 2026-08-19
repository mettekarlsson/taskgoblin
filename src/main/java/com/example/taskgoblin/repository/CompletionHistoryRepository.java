package com.example.taskgoblin.repository;

import com.example.taskgoblin.model.CompletionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CompletionHistoryRepository
        extends JpaRepository<CompletionHistory, Long> {

    void deleteByUserId(Long userId);

    Optional<CompletionHistory>
    findFirstByListIdAndUserIdOrderByCompletedAtDesc(
            Long listId,
            Long userId
    );
}