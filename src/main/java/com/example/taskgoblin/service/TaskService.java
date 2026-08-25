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
import com.example.taskgoblin.repository.CompletionHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TaskListRepository taskListRepository;
    private final CompletionHistoryRepository completionHistoryRepository;
    private final TaskMapper taskMapper;
    private final TaskListService taskListService;

    // Constructor injection.
    public TaskService(
            TaskRepository taskRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            TaskListRepository taskListRepository,
            CompletionHistoryRepository completionHistoryRepository,
            TaskMapper taskMapper,
            TaskListService taskListService
    ) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.taskListRepository = taskListRepository;
        this.completionHistoryRepository = completionHistoryRepository;
        this.taskMapper = taskMapper;
        this.taskListService = taskListService;
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
        Task task = taskMapper.mapToTaskEntity(createTaskDTO);

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
        return taskMapper.mapToTaskDto(savedTask);
    }


    // Retrieves all tasks that belong to a specific user.
    public List<TaskDTO> getAllTasks(Long userId) {

        // Fetch all tasks belonging to the user.
        List<Task> tasks = taskRepository.findByUserId(userId);

        // Convert task entities into DTOs.
        return tasks.stream()
                .map(this::activateNextOccurrenceIfDue)
                .map(taskMapper::mapToTaskDto)
                .toList();
    }

    // Retrieves all tasks that belong to a specific list
    public List<TaskDTO> getTasksByListId(
            Long listId,
            Long userId
    ) {

        // Verify list ownership
        taskListRepository
                .findByIdAndUserId(listId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task list not found"));

        List<Task> tasks = taskRepository.findByListId(listId);

        return tasks.stream()
                .map(this::activateNextOccurrenceIfDue)
                .map(taskMapper::mapToTaskDto)
                .toList();
    }

    // Retrieves a specific task that belongs to a user.
    public TaskDTO getTaskById(Long userId, Long taskId) {

        // Find task by id and verify ownership.
        Task task = getTaskByIdAndUserId(taskId, userId);

        // Convert entity into DTO.
        return taskMapper.mapToTaskDto(task);
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
                updateTaskDTO.getIsRecurring(),
                updateTaskDTO.getFrequency(),
                updateTaskDTO.getIntervalValue()
        );

        // Apply updated values to the task entity
        taskMapper.updateEntity(
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
        return taskMapper.mapToTaskDto(updatedTask);
    }

        // Marks a task as completed
    @Transactional
    public TaskDTO completeTask(
            Long taskId,
            Long userId
    ) {

        // Find task and validate ownership
        Task task =
                getTaskByIdAndUserId(
                        taskId,
                        userId
                );

        // Prevent completing an already completed
        // non-recurring task
        if (!task.isRecurring()
                && task.getStatus() == TaskStatus.DONE) {

            throw new AlreadyCompletedException(
                    "Task is already completed"
            );
        }

        // Current timestamp used for all updates
        LocalDateTime now =
                LocalDateTime.now();

        LocalDateTime previousDueAt =
                task.getDueAt();

        // Handle recurring tasks differently
        if (task.isRecurring()) {

            // Mark current occurrence as completed
            task.setStatus(TaskStatus.DONE);

            // Store completion timestamps
            task.setCompletedAt(now);
            task.setLastCompletedAt(now);

            // Move task to next occurrence
            task.setDueAt(
                    calculateNextDueAt(task)
            );

        } else {

            // Mark task as completed
            task.setStatus(TaskStatus.DONE);

            // Store completion timestamps
            task.setCompletedAt(now);
            task.setLastCompletedAt(now);
        }

        // Update system timestamp
        task.setUpdatedAt(now);

        // Save updated task
        Task updatedTask =
                taskRepository.save(task);

    CompletionHistory history =
            new CompletionHistory();

history.setUser(task.getUser());
history.setTask(task);
history.setCompletedAt(now);
history.setPreviousDueAt(previousDueAt);

completionHistoryRepository.save(history);

        if (updatedTask.getList() != null
                && updatedTask.getStatus() == TaskStatus.DONE) {

            Long listId =
                    updatedTask.getList().getId();

            List<Task> listTasks =
                    taskRepository.findByListId(listId);

            boolean allTasksCompleted =
                    !listTasks.isEmpty()
                            && listTasks.stream()
                            .allMatch(
                                    listTask ->
                                            listTask.getStatus()
                                                    == TaskStatus.DONE
                            );

            if (allTasksCompleted) {

                TaskList taskList =
                        taskListRepository
                                .findByIdAndUserId(
                                        listId,
                                        userId
                                )
                                .orElseThrow(() ->
                                        new ResourceNotFoundException(
                                                "Task list not found"
                                        ));

                if (taskList.getStatus()
                        != TaskListStatus.DONE) {

                    taskListService.completeList(
                            listId,
                            userId
                    );
                }
            }
        }

        // Convert updated entity into DTO
        return taskMapper
                .mapToTaskDto(updatedTask);
    }

    @Transactional
    public TaskDTO undoLatestCompletion(
            Long taskId,
            Long userId
    ) {

        // Find task and verify ownership
        Task task =
                getTaskByIdAndUserId(
                        taskId,
                        userId
                );

        // This undo is only for recurring tasks
        if (!task.isRecurring()) {
            throw new InvalidRecurringTaskException(
                    "Only recurring tasks can undo latest completion."
            );
        }

        // Find latest completion history entry
        CompletionHistory latestCompletion =
                completionHistoryRepository
                        .findFirstByTaskIdAndUserIdOrderByCompletedAtDesc(
                                taskId,
                                userId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Task completion history"
                                ));

        // Restore due date from before completion
        task.setDueAt(
                latestCompletion.getPreviousDueAt()
        );

        // Remove completion that is being undone
        completionHistoryRepository.delete(
                latestCompletion
        );

        /*
         * Find the completion before the one we just removed.
         * If none exists, lastCompletedAt becomes null.
         */
        LocalDateTime previousCompletedAt =
                completionHistoryRepository
                        .findFirstByTaskIdAndUserIdOrderByCompletedAtDesc(
                                taskId,
                                userId
                        )
                        .map(
                                CompletionHistory::getCompletedAt
                        )
                        .orElse(null);

        task.setLastCompletedAt(
                previousCompletedAt
        );

        // Make task active again
        task.setStatus(TaskStatus.TODO);

        // Current completion has been undone
        task.setCompletedAt(null);

        // Update system timestamp
        task.setUpdatedAt(
                LocalDateTime.now()
        );

        Task updatedTask =
                taskRepository.save(task);

        return taskMapper
                .mapToTaskDto(updatedTask);
    }

    // Reopens a completed non-recurring task
    public TaskDTO reopenTask(Long taskId, Long userId) {

        // Find task and validate ownership
        Task task = getTaskByIdAndUserId(taskId, userId);

        // Recurring tasks are not permanently completed
        if (task.isRecurring()) {

            throw new InvalidRecurringTaskException(
                    "Recurring tasks cannot be reopened."
            );
        }

        // Prevent reopening an already open task
        if (task.getStatus() == TaskStatus.TODO) {

            throw new AlreadyOpenException(
                    "Task is already open"
            );
        }

        // Restore task status
        task.setStatus(TaskStatus.TODO);

        // Clear completion timestamp
        task.setCompletedAt(null);

        // Clear latest completion timestamp
        task.setLastCompletedAt(null);

        // Update system timestamp
        task.setUpdatedAt(LocalDateTime.now());

        // Save updated task
        Task updatedTask = taskRepository.save(task);

        // Convert updated entity into DTO
        return taskMapper.mapToTaskDto(updatedTask);
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
        return taskMapper.mapToTaskDto(updatedTask);
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

    // Retrieves all tasks in a specific category for the current user.
    public List<TaskDTO> getTasksByCategoryId(Long categoryId, Long userId) {

        // Verify that the category belongs to the current user.
        categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        // Find all tasks that belong to the category.
        List<Task> tasks = taskRepository.findByCategoryId(categoryId);

        // Convert tasks to DTOs before returning them.
        return tasks.stream()
                .map(taskMapper::mapToTaskDto)
                .toList();
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
    Calculates the next occurrence for a recurring task.
     Used when a recurring task is completed to move
    the due date forward according to frequency
    and interval settings.
    */
    private LocalDateTime calculateNextDueAt(
            Task task
    ) {

        // Start from current due date
        LocalDateTime nextDueAt =
                task.getDueAt();

        // Continue until next occurrence is in the future
        do {

            nextDueAt =
                    switch (task.getFrequency()) {

                        case DAILY ->
                                nextDueAt.plusDays(
                                        task.getIntervalValue()
                                );

                        case WEEKLY ->
                                nextDueAt.plusWeeks(
                                        task.getIntervalValue()
                                );

                        case MONTHLY ->
                                nextDueAt.plusMonths(
                                        task.getIntervalValue()
                                );

                        case YEARLY ->
                                nextDueAt.plusYears(
                                        task.getIntervalValue()
                                );
                    };

        } while (!nextDueAt.isAfter(LocalDateTime.now()));

        return nextDueAt;
    }

    /*
 Validates that the due date is not in the past.
*/
    private void validateDueDate(LocalDateTime dueAt) {

        if (dueAt == null) {
            return;
        }

        if (dueAt.toLocalDate().isBefore(
                LocalDateTime.now().toLocalDate()
        )) {
            throw new InvalidDueDateException(
                    "Due date cannot be in the past."
            );
        }
    }

private Task activateNextOccurrenceIfDue(
        Task task
) {

    // Only applies to completed recurring tasks
    if (!task.isRecurring()
            || task.getStatus() != TaskStatus.DONE
            || task.getDueAt() == null) {

        return task;
    }

    LocalDateTime now =
            LocalDateTime.now();

    // Next occurrence has not started yet
    if (task.getDueAt().isAfter(now)) {
        return task;
    }

    // Make recurring task active again
    task.setStatus(TaskStatus.TODO);

    // Current completed occurrence is over
    task.setCompletedAt(null);

    /*
     * Keep lastCompletedAt.
     * It tells us when the previous occurrence was completed.
     */

    return taskRepository.save(task);
}
}
