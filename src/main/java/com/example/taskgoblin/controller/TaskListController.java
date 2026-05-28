package com.example.taskgoblin.controller;


import com.example.taskgoblin.dto.TaskListDTO;
import com.example.taskgoblin.service.TaskListService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/lists")
public class TaskListController {

    private final TaskListService taskListService;

    // Constructor injection
    public TaskListController(TaskListService taskListService) {
        this.taskListService = taskListService;
    }

    // Temporary hardcoded user until authentication is implemented
    Long hardcodedUserId = 1L;

    /*
     GET /lists

     Fetches all task lists for the current user.
    */
    @GetMapping
    public ResponseEntity<List<TaskListDTO>> getAllLists() {

        return ResponseEntity.ok(
                taskListService.getAllListsForUser(hardcodedUserId)
        );
    }

    /*
     GET /lists/{id}

     Fetches a specific task list for the current user.
    */
    @GetMapping("/{id}")
    public ResponseEntity<TaskListDTO> getListById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                taskListService.getListById(id, hardcodedUserId)
        );
    }
}
