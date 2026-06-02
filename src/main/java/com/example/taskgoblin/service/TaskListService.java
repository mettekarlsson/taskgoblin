package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.CreateTaskListDTO;
import com.example.taskgoblin.dto.TaskListDTO;
import com.example.taskgoblin.exception.ResourceNotFoundException;
import com.example.taskgoblin.mapper.TaskListMapper;
import com.example.taskgoblin.model.Category;
import com.example.taskgoblin.model.TaskList;
import com.example.taskgoblin.model.User;
import com.example.taskgoblin.repository.CategoryRepository;
import com.example.taskgoblin.repository.TaskListRepository;
import com.example.taskgoblin.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskListService {

    private final TaskListRepository taskListRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public TaskListService(
            TaskListRepository taskListRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository
    ) {
        this.taskListRepository = taskListRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
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

    public TaskListDTO createList(
            CreateTaskListDTO dto,
            Long userId
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        TaskList taskList =
                TaskListMapper.mapToTaskList(dto);

        taskList.setUser(user);
        taskList.setCreatedAt(LocalDateTime.now());
        taskList.setLastInteractedAt(LocalDateTime.now());
        taskList.setPinned(false);

        if (dto.getCategoryId() != null) {

            Category category = categoryRepository
                    .findById(dto.getCategoryId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Category not found"));

            taskList.setCategory(category);
        }

        TaskList savedList =
                taskListRepository.save(taskList);

        return TaskListMapper
                .mapToTaskListDTO(savedList);
    }
}
