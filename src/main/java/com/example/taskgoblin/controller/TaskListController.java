package com.example.taskgoblin.controller;


import com.example.taskgoblin.dto.CreateTaskListDTO;
import com.example.taskgoblin.dto.TaskListDTO;
import com.example.taskgoblin.service.TaskListService;
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

    private final TaskListService taskListService;
    private final UserService userService;

    // Constructor injection
    public TaskListController(TaskListService taskListService, UserService userService) {
        this.taskListService = taskListService;
        this.userService = userService;
    }

    /*
     GET /lists

     Fetches all task lists for the current user.
    */
    @GetMapping
    public ResponseEntity<List<TaskListDTO>> getAllLists(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        return ResponseEntity.ok(
                taskListService.getAllListsForUser(userId)
        );
    }

    /*
     GET /lists/{id}

     Fetches a specific task list for the current user.
    */
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
}
