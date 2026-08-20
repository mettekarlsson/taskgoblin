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

@RestController
@RequestMapping ("/events")
public class EventController {

    private final CalendarService calendarService;
    private final UserService userService;

    public EventController(CalendarService calendarService, UserService userService) {
        this.calendarService = calendarService;
        this.userService = userService;
    }

    //view specific event
    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEvent(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {

            Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
            return ResponseEntity.ok(calendarService.getEventById(userId, id));
        }

    //create a new event
    @PostMapping
    public ResponseEntity<EventDTO> createEvent(@AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody CreateEventDTO createEventDTO) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.status(HttpStatus.CREATED).body(calendarService.createEvent(userId, createEventDTO));
    }

    //update an event
    @PatchMapping("/{id}")
    public ResponseEntity<EventDTO> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEventDTO updateEventDTO,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(
                calendarService.updateEvent(id, userId, updateEventDTO)
        );
    }

    //delete an event
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        calendarService.deleteEvent(id, userId);
        return ResponseEntity.noContent().build();
    }
}
