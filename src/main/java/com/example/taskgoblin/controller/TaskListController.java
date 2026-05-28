package com.example.taskgoblin.controller;


import com.example.taskgoblin.dto.TaskListDTO;
import com.example.taskgoblin.service.TaskListService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/lists")
public class TaskListController {

    private final TaskListService taskListService;

    public TaskListController(TaskListService taskListService) {
        this.taskListService = taskListService;
    }

    Long hardcodedUserId = 1L;

    @GetMapping
    public List<TaskListDTO> getAllLists() {

        return taskListService.getAllListsForUser(hardcodedUserId);
    }
}
