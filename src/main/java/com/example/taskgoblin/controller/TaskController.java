package com.example.taskgoblin.controller;

import com.example.taskgoblin.dto.CreateTaskDTO;
import com.example.taskgoblin.dto.TaskDTO;
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
}