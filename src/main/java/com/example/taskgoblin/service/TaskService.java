package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.CreateTaskDTO;
import com.example.taskgoblin.dto.TaskDTO;
import com.example.taskgoblin.exception.InvalidDueDateException;
import com.example.taskgoblin.exception.ResourceNotFoundException;
import com.example.taskgoblin.mapper.TaskMapper;
import com.example.taskgoblin.model.Task;
import com.example.taskgoblin.model.TaskStatus;
import com.example.taskgoblin.model.User;
import com.example.taskgoblin.repository.TaskRepository;
import com.example.taskgoblin.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;


    // Constructor injection.

    public TaskService(
            TaskRepository taskRepository,
            UserRepository userRepository
    ) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    // Creates and saves a new task for a specific user.
    public TaskDTO createTask(Long userId, CreateTaskDTO createTaskDTO) {

        // Find the user that owns the task
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User"));

        // Convert DTO into Task entity
        Task task = TaskMapper.mapToTaskEntity(createTaskDTO);

        if (
                createTaskDTO.getDueAt() != null &&
                        createTaskDTO.getDueAt().isBefore(LocalDateTime.now())
        ) {
            throw new InvalidDueDateException(
                    "Due date cannot be in the past."
            );
        }

        // Connect task to the user
        task.setUser(user);

        // Set automatic system values
        task.setStatus(TaskStatus.TODO);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        // Save task to database
        Task savedTask = taskRepository.save(task);

        // Convert entity back into DTO
        return TaskMapper.mapToTaskDto(savedTask);
    }


    // Retrieves all tasks that belong to a specific user.

    public List<TaskDTO> getAllTasks(Long userId) {

        // Fetch all tasks belonging to the user
        List<Task> tasks = taskRepository.findByUserId(userId);

        // Convert task entities into DTOs
        return tasks.stream()
                .map(TaskMapper::mapToTaskDto)
                .toList();
    }
}
