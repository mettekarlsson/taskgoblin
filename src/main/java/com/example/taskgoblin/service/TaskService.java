package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.CreateTaskDTO;
import com.example.taskgoblin.dto.TaskDTO;
import com.example.taskgoblin.dto.UpdateDueDateDTO;
import com.example.taskgoblin.dto.UpdateTaskDTO;
import com.example.taskgoblin.exception.*;
import com.example.taskgoblin.mapper.TaskMapper;
import com.example.taskgoblin.model.*;
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

        // Validate due date rules
        validateDueDate(createTaskDTO.getDueAt());

        // Validate recurring task configuration
        validateRecurringConfiguration(
                createTaskDTO.getIsRecurring(),
                createTaskDTO.getFrequency(),
                createTaskDTO.getIntervalValue()
        );

        // Convert DTO into Task entity.
        Task task = TaskMapper.mapToTaskEntity(createTaskDTO);

        // Find category and validate ownership
        Category category = getCategoryIfOwned(
                createTaskDTO.getCategoryId(),
                userId
        );

        task.setCategory(category);

        // Find task list and validate ownership
        TaskList taskList = getTaskListIfOwned(
                createTaskDTO.getListId(),
                userId
        );

        task.setList(taskList);

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
        Task task = getTaskByIdAndUserId(taskId, userId);

        // Convert entity into DTO.
        return TaskMapper.mapToTaskDto(task);
    }

    // Deletes a task that belongs to a specific user.
    public void deleteTask(Long userId, Long taskId) {

        // Find task by id and verify ownership before deleting.
        Task task = getTaskByIdAndUserId(taskId, userId);

        // Delete task from database.
        taskRepository.delete(task);
    }

    // Updates an existing task for the current user
    public TaskDTO updateTask(Long id,
                              UpdateTaskDTO updateTaskDTO,
                              Long userId) {

        // Find task and validate ownership
        Task task = getTaskByIdAndUserId(id, userId);

        // Find related category and validate ownership
        Category category = getCategoryIfOwned(
                updateTaskDTO.getCategoryId(),
                userId
        );

        // Find related task list and validate ownership
        TaskList taskList = getTaskListIfOwned(
                updateTaskDTO.getTaskListId(),
                userId
        );

        // Validate due date rules
        validateDueDate(updateTaskDTO.getDueAt());

        // Validate recurring task configuration
        validateRecurringConfiguration(
                updateTaskDTO.getRecurring(),
                updateTaskDTO.getFrequency(),
                updateTaskDTO.getIntervalValue()
        );

        // Apply updated values to the task entity
        TaskMapper.updateEntity(
                task,
                updateTaskDTO,
                category,
                taskList
        );

        // Update system timestamp
        task.setUpdatedAt(LocalDateTime.now());

        // Save updated task
        Task updatedTask = taskRepository.save(task);

        // Convert updated entity into DTO
        return TaskMapper.mapToTaskDto(updatedTask);
    }

    // Marks a task as completed
    public TaskDTO completeTask(Long taskId, Long userId) {

        // Find task and validate ownership
        Task task = getTaskByIdAndUserId(taskId, userId);

        // Prevent completing an already completed task
        if (task.getStatus() == TaskStatus.DONE) {

            throw new TaskAlreadyCompletedException(
                    "Task is already completed"
            );
        }

        // Update task status
        task.setStatus(TaskStatus.DONE);

        // Set completion timestamps
        task.setCompletedAt(LocalDateTime.now());
        task.setLastCompletedAt(LocalDateTime.now());

        // Update system timestamp
        task.setUpdatedAt(LocalDateTime.now());

        // Save updated task
        Task updatedTask = taskRepository.save(task);

        // Convert updated entity into DTO
        return TaskMapper.mapToTaskDto(updatedTask);
    }



    // Reopens a completed task
    public TaskDTO reopenTask(Long taskId, Long userId) {

        // Find task and validate ownership
        Task task = getTaskByIdAndUserId(taskId, userId);

        // Prevent reopening an already open task
        if (task.getStatus() == TaskStatus.TODO) {

            throw new TaskAlreadyOpenException(
                    "Task is already open"
            );
        }

        // Restore task status
        task.setStatus(TaskStatus.TODO);

        // Clear completion timestamp
        task.setCompletedAt(null);

        // Update system timestamp
        task.setUpdatedAt(LocalDateTime.now());

        // Save updated task
        Task updatedTask = taskRepository.save(task);

        // Convert updated entity into DTO
        return TaskMapper.mapToTaskDto(updatedTask);
    }



    // Updates the due date of a task
    public TaskDTO updateDueDate(Long taskId,
                                 UpdateDueDateDTO dto,
                                 Long userId) {

        // Find task and validate ownership
        Task task = getTaskByIdAndUserId(taskId, userId);

        // Validate due date rules
        validateDueDate(dto.getDueAt());

        // Update due date
        task.setDueAt(dto.getDueAt());

        // Update system timestamp
        task.setUpdatedAt(LocalDateTime.now());

        // Save updated task
        Task updatedTask = taskRepository.save(task);

        // Convert updated entity into DTO
        return TaskMapper.mapToTaskDto(updatedTask);
    }





// _____________________helper________________________

    /*
 Finds a task by id and validates ownership.
 Throws ResourceNotFoundException if the task does not exist
 or does not belong to the current user.
*/
    private Task getTaskByIdAndUserId(Long taskId, Long userId) {

        return taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task not found"));
    }

    /*
 Finds a category and validates ownership.
 Returns null if no category id was provided.
*/
    private Category getCategoryIfOwned(Long categoryId, Long userId) {

        if (categoryId == null) {
            return null;
        }

        return categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));
    }

    /*
 Finds a task list and validates ownership.
 Returns null if no task list id was provided.
*/
    private TaskList getTaskListIfOwned(Long taskListId, Long userId) {

        if (taskListId == null) {
            return null;
        }

        return taskListRepository.findByIdAndUserId(taskListId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task list not found"));
    }

    /*
 Validates recurring task configuration.
 Centralized validation for recurring task rules.

 Reused across multiple endpoints to avoid duplicated
 business logic and ensure consistent validation.
*/
    private void validateRecurringConfiguration(
            Boolean recurring,
            Frequency frequency,
            Integer intervalValue
    ) {

        if (Boolean.TRUE.equals(recurring)) {

            // Recurring tasks must have a frequency
            if (frequency == null) {
                throw new InvalidRecurringTaskException(
                        "Recurring tasks must have a frequency."
                );
            }

            // Recurring tasks must have a positive interval value
            if (intervalValue == null || intervalValue <= 0) {

                throw new InvalidRecurringTaskException(
                        "Recurring tasks must have a valid interval value."
                );
            }

        } else {

            // Non-recurring tasks must not contain recurring settings
            if (frequency != null || intervalValue != null) {

                throw new InvalidRecurringTaskException(
                        "Non-recurring tasks cannot contain recurring settings."
                );
            }
        }
    }

    /*
 Validates that the due date is not in the past.
*/
    private void validateDueDate(LocalDateTime dueAt) {

        if (
                dueAt != null &&
                        dueAt.isBefore(LocalDateTime.now())
        ) {
            throw new InvalidDueDateException(
                    "Due date cannot be in the past."
            );
        }
    }

}

