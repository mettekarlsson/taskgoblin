package com.example.taskgoblin.controller;

import com.example.taskgoblin.dto.EventDTO;
import com.example.taskgoblin.service.CalendarService;
import com.example.taskgoblin.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/calendar")
public class CalendarController {

    private final CalendarService calendarService;
    private final UserService userService;

    public CalendarController(CalendarService calendarService, UserService userService) {
        this.calendarService = calendarService;
        this.userService = userService;
    }

    //get all events
    @GetMapping
    public ResponseEntity<List<EventDTO>> getAllEvents(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(calendarService.getAllEvents(userId));
    }
}
