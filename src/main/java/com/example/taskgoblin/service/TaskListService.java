package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.CreateTaskListDTO;
import com.example.taskgoblin.dto.TaskListDTO;
import com.example.taskgoblin.dto.UpdateTaskListDTO;
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

    /*
     * Repositories
     */
    private final TaskListRepository taskListRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;


    /*
     * Constructor injection
     */
    public TaskListService(
            TaskListRepository taskListRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository
    ) {
        this.taskListRepository = taskListRepository;
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

        // Updates the name only if a new value was provided.
        if (dto.getName() != null) {
            taskList.setName(dto.getName());
        }

        // Updates the color if provided.
        if (dto.getColor() != null) {
            taskList.setColor(dto.getColor());
        }

        // Updates the icon if provided.
        if (dto.getIcon() != null) {
            taskList.setIcon(dto.getIcon());
        }

        // Updates the due date if provided.
        if (dto.getDueAt() != null) {
            taskList.setDueAt(dto.getDueAt());
        }

        // Updates the pinned status if provided.
        if (dto.getPinned() != null) {
            taskList.setPinned(dto.getPinned());
        }

        // Updates recurring settings if provided.
        if (dto.getIsRecurring() != null) {
            taskList.setRecurring(dto.getIsRecurring());
        }

        // Updates the recurring frequency if provided.
        if (dto.getFrequency() != null) {
            taskList.setFrequency(dto.getFrequency());
        }

        // Updates the recurring interval value if provided.
        if (dto.getIntervalValue() != null) {
            taskList.setIntervalValue(dto.getIntervalValue());
        }

        // Updates the category if a category ID was provided.
        if (dto.getCategoryId() != null) {

            // Fetches the category from the database.
            Category category = categoryRepository
                    .findById(dto.getCategoryId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Category"));

            taskList.setCategory(category);
        }

        // Updates the timestamp for the latest interaction.
        taskList.setLastInteractedAt(LocalDateTime.now());

        // Saves the updated task list.
        TaskList updatedList =
                taskListRepository.save(taskList);

        // Converts the updated entity into a response DTO.
        return TaskListMapper
                .mapToTaskListDTO(updatedList);
    }
}
