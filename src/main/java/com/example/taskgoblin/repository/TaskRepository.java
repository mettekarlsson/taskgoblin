package com.example.taskgoblin.repository;

import com.example.taskgoblin.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserId(Long userId);

    Optional<Task> findByIdAndUserId(Long id, Long userId);

    void deleteByUserId(Long userId);

    List<Task> findByListId(Long listId);
}
