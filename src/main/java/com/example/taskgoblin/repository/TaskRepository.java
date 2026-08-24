package com.example.taskgoblin.repository;

import com.example.taskgoblin.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserId(Long userId);

    Optional<Task> findByIdAndUserId(Long id, Long userId);

    void deleteByUserId(Long userId);

    void deleteByListId(Long listId);

    List<Task> findByListId(Long listId);

    // Finds all tasks that belong to a specific category.
    List<Task> findByCategoryId(Long categoryId);
}
