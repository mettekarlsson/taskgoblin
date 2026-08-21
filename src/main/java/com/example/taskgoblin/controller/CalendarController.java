package com.example.taskgoblin.controller;

import com.example.taskgoblin.dto.EventSummaryDTO;
import com.example.taskgoblin.service.CalendarService;
import com.example.taskgoblin.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    //get events between certain date-range.
    @GetMapping
    public ResponseEntity<List<EventSummaryDTO>> getEvents(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        return ResponseEntity.ok(calendarService.getEventsByDateRange(userId, startDate, endDate));
    }
}