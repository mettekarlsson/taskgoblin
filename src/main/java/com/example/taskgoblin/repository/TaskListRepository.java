package com.example.taskgoblin.repository;

import com.example.taskgoblin.model.TaskList;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskListRepository
        extends JpaRepository<TaskList, Long> {
}
