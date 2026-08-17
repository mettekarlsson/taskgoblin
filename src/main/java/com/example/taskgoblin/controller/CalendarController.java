package com.example.taskgoblin.controller;

import com.example.taskgoblin.dto.CreateEventDTO;
import com.example.taskgoblin.dto.EventDTO;
import com.example.taskgoblin.dto.UpdateEventDTO;
import com.example.taskgoblin.service.CalendarService;
import com.example.taskgoblin.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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


    //no longer relevant, i incoorporated this endpoint in the one below, to include both all events and date range
//    //get all events
//    @GetMapping
//    public ResponseEntity<List<EventDTO>> getAllEvents(@AuthenticationPrincipal UserDetails userDetails) {
//        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
//        return ResponseEntity.ok(calendarService.getAllEvents(userId));
//    }

    //get all events OR get events between certain date-range
    @GetMapping
    public ResponseEntity<List<EventDTO>> getEvents(
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(calendarService.getEventsByDateRange(userId, startDate, endDate));
        }
        return ResponseEntity.ok(calendarService.getAllEvents(userId));
    }

    //create a new event
    @PostMapping
    public ResponseEntity<EventDTO> createEvent(@AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody CreateEventDTO createEventDTO) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.status(HttpStatus.CREATED).body(calendarService.createEvent(userId, createEventDTO));
    }

    //delete an event
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        calendarService.deleteEvent(id, userId);
        return ResponseEntity.ok("Event deleted successfully");
    }

    //update an event
    @PatchMapping("/{id}")
    public ResponseEntity<EventDTO> updateEvent(
            @PathVariable Long id,
            @RequestBody UpdateEventDTO updateEventDTO,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(
                calendarService.updateEvent(id, userId, updateEventDTO)
        );
    }
}
