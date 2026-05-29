package com.example.taskgoblin.controller;

import com.example.taskgoblin.dto.CreateTaskDTO;
import com.example.taskgoblin.dto.TaskDTO;
import com.example.taskgoblin.dto.UpdateDueDateDTO;
import com.example.taskgoblin.dto.UpdateTaskDTO;
import com.example.taskgoblin.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;

    // Constructor injection.
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /*
     POST /tasks

     Creates a new task for the current user.
    */
    @PostMapping
    public ResponseEntity<TaskDTO> createTask(
            @Valid @RequestBody CreateTaskDTO createTaskDTO
    ) {

        // Temporary hardcoded user until authentication is implemented.
        Long hardcodedUserId = 1L;

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(taskService.createTask(hardcodedUserId, createTaskDTO));
    }

    /*
     GET /tasks

     Returns all tasks that belong to the current user.
    */
    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAllTasks() {

        // Temporary hardcoded user until authentication is implemented.
        Long hardcodedUserId = 1L;

        return ResponseEntity.ok(
                taskService.getAllTasks(hardcodedUserId)
        );
    }

    /*
     GET /tasks/{id}

     Returns a specific task that belongs to the current user.
    */
    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(
            @PathVariable Long id
    ) {

        // Temporary hardcoded user until authentication is implemented.
        Long hardcodedUserId = 1L;

        return ResponseEntity.ok(
                taskService.getTaskById(hardcodedUserId, id)
        );
    }

    /*
     DELETE /tasks/{id}

     Deletes a task that belongs to the current user.
    */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id
    ) {

        // Temporary hardcoded user until authentication is implemented.
        Long hardcodedUserId = 1L;

        taskService.deleteTask(hardcodedUserId, id);

        return ResponseEntity.noContent().build();
    }


    /*
 Updates an existing task for the current user.
*/
    @PutMapping("/{id}")
    public TaskDTO updateTask(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskDTO updateTaskDTO
    ) {

        // Temporary hardcoded user id
        Long userId = 1L;

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
    public TaskDTO completeTask(@PathVariable Long id) {

        // Temporary hardcoded user id
        Long userId = 1L;

        return taskService.completeTask(id, userId);
    }


    /*
 Reopens a completed task.
*/
    @PatchMapping("/{id}/reopen")
    public TaskDTO reopenTask(@PathVariable Long id) {

        // Temporary hardcoded user id
        Long userId = 1L;

        return taskService.reopenTask(id, userId);
    }

    /*
 Updates the due date of a task.
*/
    @PatchMapping("/{id}/due-date")
    public TaskDTO updateDueDate(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDueDateDTO dto
    ) {

        // Temporary hardcoded user id
        Long userId = 1L;

        return taskService.updateDueDate(
                id,
                dto,
                userId
        );
    }

}