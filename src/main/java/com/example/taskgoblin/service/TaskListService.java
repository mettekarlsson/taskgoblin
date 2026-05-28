package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.TaskListDTO;
import com.example.taskgoblin.exception.ResourceNotFoundException;
import com.example.taskgoblin.mapper.TaskListMapper;
import com.example.taskgoblin.model.TaskList;
import com.example.taskgoblin.repository.TaskListRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
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

    public TaskListDTO getListById(Long listId, Long userId) {

        TaskList taskList = taskListRepository
                .findByIdAndUserId(listId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task list not found"));

        return TaskListMapper.mapToTaskListDTO(taskList);
    }
}
