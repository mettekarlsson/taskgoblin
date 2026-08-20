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
import com.example.taskgoblin.repository.CompletionHistoryRepository;
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
    private final CompletionHistoryRepository completionHistoryRepository;



    /*
     * Constructor injection
     */
    public TaskListService(
            TaskListRepository taskListRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            CompletionHistoryRepository completionHistoryRepository
    ) {
        this.taskListRepository = taskListRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.completionHistoryRepository = completionHistoryRepository;
    }


    /*
     * Read operations
     */
    public List<TaskListDTO> getAllListsForUser(Long userId) {

        List<TaskList> taskLists = taskListRepository.findByUserId(userId);

        return taskLists.stream()
                .map(this::activateNextOccurrenceIfDue)
                .map(TaskListMapper::mapToTaskListDTO)
                .toList();
    }

    public TaskListDTO getListById(Long listId, Long userId) {

        TaskList taskList = taskListRepository
                .findByIdAndUserId(listId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task list not found"));

        taskList =
                activateNextOccurrenceIfDue(taskList);

        return TaskListMapper
                .mapToTaskListDTO(taskList);
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

        LocalDateTime previousDueAt =
                taskList.getDueAt();


        if (taskList.isRecurring()) {

            // Mark the current occurrence as completed
            taskList.setStatus(TaskListStatus.DONE);

            // Store completion timestamps
            taskList.setCompletedAt(now);
            taskList.setLastCompletedAt(now);

            // Schedule next occurrence from actual completion time
            taskList.setDueAt(
                    calculateNextDueAt(taskList, now)
            );

            /*
             * Do NOT reset child tasks here.
             * They stay as they are until the next occurrence begins.
             */

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

        // Save list completion in history
        CompletionHistory history =
                new CompletionHistory();

        history.setUser(taskList.getUser());
        history.setList(taskList);
        history.setCompletedAt(now);
        history.setPreviousDueAt(previousDueAt);

        completionHistoryRepository.save(history);

        // Convert updated entity into DTO
        return TaskListMapper
                .mapToTaskListDTO(updatedList);
    }

    public TaskListDTO undoLatestCompletion(
            Long listId,
            Long userId
    ) {

        // Find list and verify ownership
        TaskList taskList = taskListRepository
                .findByIdAndUserId(listId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task list"));

        // This undo is for recurring list occurrences
        if (!taskList.isRecurring()) {
            throw new InvalidRecurringTaskException(
                    "Only recurring task lists can undo latest completion."
            );
        }

        // Find latest completion history entry
        CompletionHistory latestCompletion =
                completionHistoryRepository
                        .findFirstByListIdAndUserIdOrderByCompletedAtDesc(
                                listId,
                                userId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "List completion history"
                                ));

        // Restore the due date that existed before completion
        taskList.setDueAt(
                latestCompletion.getPreviousDueAt()
        );

        // Remove the completion that is being undone
        completionHistoryRepository.delete(latestCompletion);

    /*
     Find the completion before the one we just removed.
     If none exists, lastCompletedAt becomes null.
    */
        LocalDateTime previousCompletedAt =
                completionHistoryRepository
                        .findFirstByListIdAndUserIdOrderByCompletedAtDesc(
                                listId,
                                userId
                        )
                        .map(CompletionHistory::getCompletedAt)
                        .orElse(null);

        taskList.setLastCompletedAt(previousCompletedAt);

        // Recurring list stays active
        taskList.setStatus(TaskListStatus.TODO);
        taskList.setCompletedAt(null);

        taskList.setLastInteractedAt(
                LocalDateTime.now()
        );

        TaskList updatedList =
                taskListRepository.save(taskList);

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
         TaskList taskList,
         LocalDateTime completedAt
 ) {

     return switch (taskList.getFrequency()) {

         case DAILY ->
                 completedAt.plusDays(
                         taskList.getIntervalValue()
                 );

         case WEEKLY ->
                 completedAt.plusWeeks(
                         taskList.getIntervalValue()
                 );

         case MONTHLY ->
                 completedAt.plusMonths(
                         taskList.getIntervalValue()
                 );

         case YEARLY ->
                 completedAt.plusYears(
                         taskList.getIntervalValue()
                 );
     };
 }

    private LocalDateTime calculatePreviousDueAt(
            TaskList taskList
    ) {

        LocalDateTime dueAt =
                taskList.getDueAt();

        return switch (taskList.getFrequency()) {

            case DAILY ->
                    dueAt.minusDays(
                            taskList.getIntervalValue()
                    );

            case WEEKLY ->
                    dueAt.minusWeeks(
                            taskList.getIntervalValue()
                    );

            case MONTHLY ->
                    dueAt.minusMonths(
                            taskList.getIntervalValue()
                    );

            case YEARLY ->
                    dueAt.minusYears(
                            taskList.getIntervalValue()
                    );
        };
    }

    private TaskList activateNextOccurrenceIfDue(
            TaskList taskList
    ) {

        // Only applies to completed recurring lists
        if (!taskList.isRecurring()
                || taskList.getStatus() != TaskListStatus.DONE
                || taskList.getDueAt() == null) {

            return taskList;
        }

        LocalDateTime now =
                LocalDateTime.now();

        // Next occurrence has not started yet
        if (taskList.getDueAt().isAfter(now)) {
            return taskList;
        }

        // Reset completed child tasks for the new occurrence
        resetCompletedTasksForNextOccurrence(taskList);

        // Make the recurring list active again
        taskList.setStatus(TaskListStatus.TODO);

        // It is no longer the currently completed occurrence
        taskList.setCompletedAt(null);

        /*
         * Keep lastCompletedAt.
         * It tells us when the previous occurrence was completed.
         */

        /*
         * Do NOT update lastInteractedAt here.
         * This is an automatic rollover, not a user interaction.
         */

        return taskListRepository.save(taskList);
    }
}
