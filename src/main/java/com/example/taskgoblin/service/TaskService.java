package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.CreateTaskDTO;
import com.example.taskgoblin.dto.TaskDTO;
import com.example.taskgoblin.exception.InvalidDueDateException;
import com.example.taskgoblin.exception.InvalidRecurringTaskException;
import com.example.taskgoblin.exception.ResourceNotFoundException;
import com.example.taskgoblin.mapper.TaskMapper;
import com.example.taskgoblin.model.Category;
import com.example.taskgoblin.model.Task;
import com.example.taskgoblin.model.TaskList;
import com.example.taskgoblin.model.TaskStatus;
import com.example.taskgoblin.model.User;
import com.example.taskgoblin.repository.CategoryRepository;
import com.example.taskgoblin.repository.TaskListRepository;
import com.example.taskgoblin.repository.TaskRepository;
import com.example.taskgoblin.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TaskListRepository taskListRepository;

    // Constructor injection.
    public TaskService(
            TaskRepository taskRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            TaskListRepository taskListRepository
    ) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.taskListRepository = taskListRepository;
    }

    // Creates and saves a new task for a specific user.
    public TaskDTO createTask(Long userId, CreateTaskDTO createTaskDTO) {

        // Find the user that owns the task.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User"));

        // Validate due date before saving the task.
        if (
                createTaskDTO.getDueAt() != null &&
                        createTaskDTO.getDueAt().isBefore(LocalDateTime.now())
        ) {
            throw new InvalidDueDateException(
                    "Due date cannot be in the past."
            );
        }

        // Validate recurring task fields.
        if (Boolean.TRUE.equals(createTaskDTO.getIsRecurring())) {

            // Recurring tasks must have a frequency.
            if (createTaskDTO.getFrequency() == null) {
                throw new InvalidRecurringTaskException(
                        "Recurring tasks must have a frequency."
                );
            }

            // Recurring tasks must have a positive interval value.
            if (
                    createTaskDTO.getIntervalValue() == null ||
                            createTaskDTO.getIntervalValue() <= 0
            ) {
                throw new InvalidRecurringTaskException(
                        "Recurring tasks must have a valid interval value."
                );
            }
        }

        // Convert DTO into Task entity.
        Task task = TaskMapper.mapToTaskEntity(createTaskDTO);

        // Connect category if categoryId exists.
        // The category must belong to the current user.
        if (createTaskDTO.getCategoryId() != null) {

            Category category = categoryRepository
                    .findByIdAndUserId(
                            createTaskDTO.getCategoryId(),
                            userId
                    )
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Category"));

            task.setCategory(category);
        }

        // Connect task list if listId exists.
        if (createTaskDTO.getListId() != null) {

            TaskList list = taskListRepository
                    .findById(createTaskDTO.getListId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Task list"));

            task.setList(list);
        }

        // Connect task to the user.
        task.setUser(user);

        // Set automatic system values.
        task.setStatus(TaskStatus.TODO);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        // Save task to database.
        Task savedTask = taskRepository.save(task);

        // Convert entity back into DTO.
        return TaskMapper.mapToTaskDto(savedTask);
    }

    // Retrieves all tasks that belong to a specific user.
    public List<TaskDTO> getAllTasks(Long userId) {

        // Fetch all tasks belonging to the user.
        List<Task> tasks = taskRepository.findByUserId(userId);

        // Convert task entities into DTOs.
        return tasks.stream()
                .map(TaskMapper::mapToTaskDto)
                .toList();
    }

    // Retrieves a specific task that belongs to a user.
    public TaskDTO getTaskById(Long userId, Long taskId) {

        // Find task by id and verify ownership.
        Task task = taskRepository
                .findByIdAndUserId(taskId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task"));

        // Convert entity into DTO.
        return TaskMapper.mapToTaskDto(task);
    }

    // Deletes a task that belongs to a specific user.
    public void deleteTask(Long userId, Long taskId) {

        // Find task by id and verify ownership before deleting.
        Task task = taskRepository
                .findByIdAndUserId(taskId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task"));

        // Delete task from database.
        taskRepository.delete(task);
    }
}