package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.*;
import com.example.taskgoblin.exception.AlreadyCompletedException;
import com.example.taskgoblin.exception.AlreadyOpenException;
import com.example.taskgoblin.exception.InvalidRecurringTaskException;
import com.example.taskgoblin.exception.ResourceNotFoundException;
import com.example.taskgoblin.mapper.TaskListMapper;
import com.example.taskgoblin.model.*;
import com.example.taskgoblin.repository.CategoryRepository;
import com.example.taskgoblin.repository.TaskListRepository;
import com.example.taskgoblin.repository.TaskRepository;
import com.example.taskgoblin.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskListService {

    /*
     * Repositories
     */
    private final TaskListRepository taskListRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;


    /*
     * Constructor injection
     */
    public TaskListService(
            TaskListRepository taskListRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository
    ) {
        this.taskListRepository = taskListRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }


    /*
     * Read operations
     */
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

    // Show progress in List
    public TaskListProgressDTO getListProgress(
            Long listId,
            Long userId
    ) {

        // Verify ownership
        taskListRepository
                .findByIdAndUserId(listId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task list not found"));

        List<Task> tasks = taskRepository.findByListId(listId);

        int totalTasks = tasks.size();

        int completedTasks = (int) tasks.stream()
                .filter(task -> task.getStatus() == TaskStatus.DONE)
                .count();

        int progressPercentage = 0;

        if (totalTasks > 0) {
            progressPercentage =
                    (completedTasks * 100) / totalTasks;
        }

        return new TaskListProgressDTO(
                totalTasks,
                completedTasks,
                progressPercentage
        );
    }

    // Retrieves all task lists in a specific category for the current user.
    public List<TaskListDTO> getListsByCategoryId(
            Long categoryId,
            Long userId
    ) {

        // Verify that the category belongs to the current user.
        categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        // Find all task lists that belong to the selected category.
        List<TaskList> taskLists =
                taskListRepository.findByCategoryId(categoryId);

        // Convert task lists to DTOs before returning them.
        return taskLists.stream()
                .map(TaskListMapper::mapToTaskListDTO)
                .toList();
    }

    /*
     * Create operations
     */
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


    /*
     * Update operations
     */
    public TaskListDTO updateList(
            Long listId,
            UpdateTaskListDTO dto,
            Long userId
    ) {

        // Fetches the task list that belongs to the current user.
        // Prevents users from updating lists they do not own.
        TaskList taskList = taskListRepository
                .findByIdAndUserId(listId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task list"));

        // Tracks whether list content/settings were updated.
        // Pinning alone should not change lastInteractedAt.
        boolean contentWasUpdated = false;

        // Updates the name only if a new value was provided.
        if (dto.getName() != null) {
            taskList.setName(dto.getName());
            contentWasUpdated = true;
        }

        // Updates the color if provided.
        if (dto.getColor() != null) {
            taskList.setColor(dto.getColor());
            contentWasUpdated = true;
        }

        // Updates the icon if provided.
        if (dto.getIcon() != null) {
            taskList.setIcon(dto.getIcon());
            contentWasUpdated = true;
        }

        // Updates the due date if provided.
        if (dto.getDueAt() != null) {
            taskList.setDueAt(dto.getDueAt());
            contentWasUpdated = true;
        }

        // Updates the pinned status if provided.
        // Pinning should not count as interaction.
        if (dto.getPinned() != null) {
            taskList.setPinned(dto.getPinned());
        }

        // Updates recurring settings if provided.
        if (dto.getIsRecurring() != null) {
            taskList.setRecurring(dto.getIsRecurring());
            contentWasUpdated = true;
        }

        // Updates the recurring frequency if provided.
        if (dto.getFrequency() != null) {
            taskList.setFrequency(dto.getFrequency());
            contentWasUpdated = true;
        }

        // Updates the recurring interval value if provided.
        if (dto.getIntervalValue() != null) {
            taskList.setIntervalValue(dto.getIntervalValue());
            contentWasUpdated = true;
        }

        // Updates the category if a category ID was provided.
        if (dto.getCategoryId() != null) {

            // Fetches the category from the database.
            Category category = categoryRepository
                    .findById(dto.getCategoryId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Category"));

            taskList.setCategory(category);
            contentWasUpdated = true;
        }

        // Only update interaction timestamp when actual
        // list content or settings were changed.
        if (contentWasUpdated) {
            taskList.setLastInteractedAt(LocalDateTime.now());
        }

        // Saves the updated task list.
        TaskList updatedList =
                taskListRepository.save(taskList);

        // Converts the updated entity into a response DTO.
        return TaskListMapper
                .mapToTaskListDTO(updatedList);
    }

    public TaskListDTO completeList(Long listId, Long userId) {

        // Find task list and validate ownership
        TaskList taskList = taskListRepository
                .findByIdAndUserId(listId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task list"));

        // Prevent completing an already completed
        // non-recurring list
        if (!taskList.isRecurring()
                && taskList.getStatus() == TaskListStatus.DONE) {

            throw new AlreadyCompletedException(
                    "Task list is already completed"
            );
        }

        // Current timestamp used for all updates
        LocalDateTime now =
                LocalDateTime.now();

        if (taskList.isRecurring()) {

            // Store latest completion timestamp
            taskList.setLastCompletedAt(now);

            // Move list to next occurrence
            taskList.setDueAt(
                    calculateNextDueAt(taskList)
            );

            // Keep recurring list active
            taskList.setStatus(TaskListStatus.TODO);

            // Recurring lists are never permanently completed
            taskList.setCompletedAt(null);

            // Reset completed child tasks for next occurrence
            resetCompletedTasksForNextOccurrence(taskList);

        } else {

            // Mark list as completed
            taskList.setStatus(TaskListStatus.DONE);

            // Store completion timestamps
            taskList.setCompletedAt(now);
            taskList.setLastCompletedAt(now);
        }

        // Update interaction timestamp
        taskList.setLastInteractedAt(now);

        // Save updated task list
        TaskList updatedList =
                taskListRepository.save(taskList);

        // Convert updated entity into DTO
        return TaskListMapper
                .mapToTaskListDTO(updatedList);
    }


    public TaskListDTO reopenList(Long listId, Long userId) {

        // Find task list and validate ownership
        TaskList taskList = taskListRepository
                .findByIdAndUserId(listId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task list"));

        // Recurring lists are not permanently completed
        if (taskList.isRecurring()) {

            throw new InvalidRecurringTaskException(
                    "Recurring task lists cannot be reopened."
            );
        }

        // Prevent reopening an already open list
        if (taskList.getStatus() != TaskListStatus.DONE) {

            throw new AlreadyOpenException(
                    "Only completed task lists can be reopened"
            );
        }

        // Restore task list status
        taskList.setStatus(TaskListStatus.TODO);

        // Clear completion timestamps
        taskList.setCompletedAt(null);
        taskList.setLastCompletedAt(null);

        // Update interaction timestamp
        taskList.setLastInteractedAt(LocalDateTime.now());

        // Save updated task list
        TaskList updatedList =
                taskListRepository.save(taskList);

        // Convert updated entity into DTO
        return TaskListMapper
                .mapToTaskListDTO(updatedList);
    }

    public TaskListDTO updateDueDate(
            Long listId,
            UpdateDueDateDTO dto,
            Long userId
    ) {

        TaskList taskList = taskListRepository
                .findByIdAndUserId(listId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task list"));

        taskList.setDueAt(dto.getDueAt());

        taskList.setLastInteractedAt(LocalDateTime.now());

        TaskList updatedList =
                taskListRepository.save(taskList);

        return TaskListMapper.mapToTaskListDTO(updatedList);
    }


    /*
     * Delete operations
     */

    public void deleteList(
            Long listId,
            Long userId
    ) {

        // Fetches the task list that belongs to the current user.
        // Prevents users from deleting lists they do not own.
        TaskList taskList = taskListRepository
                .findByIdAndUserId(listId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task list"));

        // Deletes the task list from the database.
        taskListRepository.delete(taskList);
    }

    /*
 ---- HELPER -----

     */
    /*
 Resets completed tasks in a recurring list
 so they are ready for the next occurrence.

 Completion history and lastCompletedAt are preserved.
*/
    private void resetCompletedTasksForNextOccurrence(
            TaskList taskList
    ) {

        List<Task> tasks =
                taskRepository.findByListId(
                        taskList.getId()
                );

        LocalDateTime now =
                LocalDateTime.now();

        for (Task task : tasks) {

            // Only reset tasks that were completed
            if (task.getStatus() == TaskStatus.DONE) {

                // Make task available again
                task.setStatus(TaskStatus.TODO);

                // Task is no longer permanently completed
                task.setCompletedAt(null);

                // Keep lastCompletedAt unchanged so we still know
                // when the task was last completed

                task.setUpdatedAt(now);
            }
        }

        taskRepository.saveAll(tasks);
    }

 /*
 Calculates the next occurrence for a recurring task list.

 Used when a recurring task list is completed to move
 the due date forward according to frequency
 and interval settings.
*/
    private LocalDateTime calculateNextDueAt(
            TaskList taskList
    ) {

        // Start from current due date
        LocalDateTime nextDueAt =
                taskList.getDueAt();

        // Continue until next occurrence is in the future
        do {

            nextDueAt =
                    switch (taskList.getFrequency()) {

                        case DAILY ->
                                nextDueAt.plusDays(
                                        taskList.getIntervalValue()
                                );

                        case WEEKLY ->
                                nextDueAt.plusWeeks(
                                        taskList.getIntervalValue()
                                );

                        case MONTHLY ->
                                nextDueAt.plusMonths(
                                        taskList.getIntervalValue()
                                );

                        case YEARLY ->
                                nextDueAt.plusYears(
                                        taskList.getIntervalValue()
                                );
                    };

        } while (!nextDueAt.isAfter(LocalDateTime.now()));

        return nextDueAt;
    }
}
