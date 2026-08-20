package com.example.taskgoblin.controller;

import com.example.taskgoblin.dto.EventSummaryDTO;
import com.example.taskgoblin.exception.ErrorResponse;
import com.example.taskgoblin.service.CalendarService;
import com.example.taskgoblin.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;


@RestController
@RequestMapping("/calendar")
public class CalendarController {

    private final CalendarService calendarService;
    private final UserService userService;

    public CalendarController(CalendarService calendarService, UserService userService) {
        this.calendarService = calendarService;
        this.userService = userService;
    }

    //get all events OR get events between certain date-range.
    //ResponseEntity<?> because this method can return two different body types:
    //a List<EventSummaryDTO> on success, or an ErrorResponse when the date
    //parameters are invalid.
    @GetMapping
    public ResponseEntity<?> getEvents(
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // startDate and endDate belong together. If only one of them was sent,
        // the frontend (or whoever is testing the API) probably forgot the other one.
        boolean hasStartDate = startDate != null;
        boolean hasEndDate = endDate != null;

        // true if exactly one of the two dates is present
        boolean onlyOneProvided = (hasStartDate && !hasEndDate) || (hasEndDate && !hasStartDate);

        if (onlyOneProvided) {
            // Reject instead of silently falling back to "all events" below,
            // which would hide a likely mistake from the caller.
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ErrorResponse(
                            HttpStatus.BAD_REQUEST.value(),
                            "Both startDate and endDate must be provided together, or neither."
                    )
            );
        }

        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        // At this point we know both dates are present or both are absent,
        // so checking one of them is enough.
        if (hasStartDate) {
            return ResponseEntity.ok(calendarService.getEventsByDateRange(userId, startDate, endDate));
        }
        return ResponseEntity.ok(calendarService.getAllEvents(userId));
    }
}