package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.TaskListDTO;
import com.example.taskgoblin.mapper.TaskListMapper;
import com.example.taskgoblin.model.TaskList;
import com.example.taskgoblin.repository.TaskListRepository;

import java.util.List;

public class TaskListService {

    private final TaskListRepository taskListRepository;

    public TaskListService(TaskListRepository taskListRepository) {
        this.taskListRepository = taskListRepository;
    }

    public List<TaskListDTO> getAllListsForUser(Long userId) {

        List<TaskList> taskLists = taskListRepository.findByUserId(userId);

        return taskLists.stream()
                .map(TaskListMapper::mapToTaskListDTO)
                .toList();
    }
}
