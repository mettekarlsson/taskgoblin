package com.example.taskgoblin.controller;

import com.example.taskgoblin.dto.CreateTaskDTO;
import com.example.taskgoblin.dto.TaskDTO;
import com.example.taskgoblin.dto.UpdateDueDateDTO;
import com.example.taskgoblin.dto.UpdateTaskDTO;
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
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;

    // Constructor injection.
    public TaskController(TaskService taskService, UserService userService) {
        this.taskService = taskService;
        this.userService = userService;
    }

    /*
     POST /tasks

     Creates a new task for the current user.
    */
    @PostMapping
    public ResponseEntity<TaskDTO> createTask(
            @Valid @RequestBody CreateTaskDTO createTaskDTO,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(taskService.createTask(userId, createTaskDTO));
    }

    /*
     GET /tasks

     Returns all tasks that belong to the current user.
    */
    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAllTasks(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        return ResponseEntity.ok(
                taskService.getAllTasks(userId)
        );
    }

    /*
 GET /tasks/category/{id}

 Returns all tasks that belong to a specific category
 for the current user.
*/
    @GetMapping("/category/{id}")
    public ResponseEntity<List<TaskDTO>> getTasksByCategory(
            @PathVariable("id") Long categoryId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        return ResponseEntity.ok(
                taskService.getTasksByCategoryId(categoryId, userId)
        );
    }


    /*
     GET /tasks/{id}

     Returns a specific task that belongs to the current user.
    */
    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        return ResponseEntity.ok(
                taskService.getTaskById(userId, id)
        );
    }

    /*
     DELETE /tasks/{id}

     Deletes a task that belongs to the current user.
    */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        taskService.deleteTask(userId, id);

        return ResponseEntity.noContent().build();
    }


    /*
 Updates an existing task for the current user.
*/
    @PutMapping("/{id}")
    public TaskDTO updateTask(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskDTO updateTaskDTO,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        return taskService.updateTask(
                id,
                updateTaskDTO,
                userId
        );
    }

    /*
    Marks a task as completed.
    */
    @PatchMapping("/{id}/complete")
    public TaskDTO completeTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        return taskService.completeTask(id, userId);
    }

    @PatchMapping("/{id}/undo-complete")
    public TaskDTO undoLatestCompletion(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Long userId =
                userService
                        .getUserByEmail(
                                userDetails.getUsername()
                        )
                        .getId();

        return taskService
                .undoLatestCompletion(
                        id,
                        userId
                );
    }

    /*
 Reopens a completed task.
*/
    @PatchMapping("/{id}/reopen")
    public TaskDTO reopenTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        return taskService.reopenTask(id, userId);
    }

    /*
 Updates the due date of a task.
*/
    @PatchMapping("/{id}/due-date")
    public TaskDTO updateDueDate(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDueDateDTO dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        return taskService.updateDueDate(
                id,
                dto,
                userId
        );
    }

}