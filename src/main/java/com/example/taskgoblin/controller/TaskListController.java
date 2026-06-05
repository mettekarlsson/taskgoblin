package com.example.taskgoblin.controller;


import com.example.taskgoblin.dto.*;
import com.example.taskgoblin.service.TaskListService;
import com.example.taskgoblin.service.TaskService;
import com.example.taskgoblin.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/lists")
public class TaskListController {

     /*
     * Services
     */
    private final TaskListService taskListService;
    private final TaskService taskService;
    private final UserService userService;


     /*
     * Constructor injection
     */
    public TaskListController(
            TaskListService taskListService,
            TaskService taskService,
            UserService userService) {

        this.taskListService = taskListService;
        this.taskService = taskService;
        this.userService = userService;
    }


     /*
     * Read operations
     */

     // GET /lists Fetches all task lists for the current user.
    @GetMapping
    public ResponseEntity<List<TaskListDTO>> getAllLists(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        return ResponseEntity.ok(
                taskListService.getAllListsForUser(userId)
        );
    }

    // GET /lists/{id}  Fetches a specific task list for the current user.
    @GetMapping("/{id}")
    public ResponseEntity<TaskListDTO> getListById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        return ResponseEntity.ok(
                taskListService.getListById(id, userId)
        );
    }

    // GET /lists/{id}/tasks - Fetched tasks for a specific list
    @GetMapping("/{listId}/tasks")
    public ResponseEntity<List<TaskDTO>> getTasksInList(
            @PathVariable Long listId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Long userId = userService
                .getUserByEmail(userDetails.getUsername())
                .getId();

        return ResponseEntity.ok(
                taskService.getTasksByListId(listId, userId)
        );
    }


     /*
     * Create operations
     */

    // POST/lists
    @PostMapping
    public ResponseEntity<TaskListDTO> createList(
            @Valid @RequestBody CreateTaskListDTO dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Long userId = userService
                .getUserByEmail(userDetails.getUsername())
                .getId();

        TaskListDTO createdList =
                taskListService.createList(dto, userId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdList);
    }

    // Create task in a list
    @PostMapping("/{listId}/tasks")
    public ResponseEntity<TaskDTO> createTaskInList(
            @PathVariable Long listId,
            @Valid @RequestBody CreateTaskDTO dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Long userId = userService
                .getUserByEmail(userDetails.getUsername())
                .getId();

        dto.setListId(listId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(taskService.createTask(userId, dto));
    }

     /*
     * Update operations
     */

    // PUT/lists/{id}
    @PutMapping("/{id}")
    public ResponseEntity<TaskListDTO> updateList(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskListDTO dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Long userId = userService
                .getUserByEmail(userDetails.getUsername())
                .getId();

        TaskListDTO updatedList =
                taskListService.updateList(id, dto, userId);

        return ResponseEntity.ok(updatedList);
    }


    @PatchMapping("/{id}/complete")
    public TaskListDTO completeList(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        return taskListService.completeList(id, userId);
    }


    @PatchMapping("/{id}/reopen")
    public TaskListDTO reopenList(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        return taskListService.reopenList(id, userId);
    }

    @PatchMapping("/{id}/due-date")
    public TaskListDTO updateDueDate(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDueDateDTO dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Long userId = userService
                .getUserByEmail(userDetails.getUsername())
                .getId();

        return taskListService.updateDueDate(id, dto, userId);
    }

    /*
     * Delete operations
     */

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteList(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Long userId = userService
                .getUserByEmail(userDetails.getUsername())
                .getId();

        taskListService.deleteList(id, userId);

        return ResponseEntity.noContent().build();
    }
}
