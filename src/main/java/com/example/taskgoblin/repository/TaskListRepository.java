package com.example.taskgoblin.repository;

import com.example.taskgoblin.model.TaskList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskListRepository extends JpaRepository<TaskList, Long> {

    List<TaskList> findByUserId(Long userId);

}
