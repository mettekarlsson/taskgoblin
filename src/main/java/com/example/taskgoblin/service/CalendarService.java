package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.CreateEventDTO;
import com.example.taskgoblin.dto.EventDTO;
import com.example.taskgoblin.dto.EventSummaryDTO;
import com.example.taskgoblin.dto.UpdateEventDTO;
import com.example.taskgoblin.exception.InvalidEventException;
import com.example.taskgoblin.exception.ResourceNotFoundException;
import com.example.taskgoblin.mapper.EventMapper;
import com.example.taskgoblin.model.*;
import com.example.taskgoblin.repository.CalendarRepository;
import com.example.taskgoblin.repository.CategoryRepository;
import com.example.taskgoblin.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CalendarService {

    private final CalendarRepository calendarRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public CalendarService(CalendarRepository calendarRepository, UserRepository userRepository, CategoryRepository categoryRepository) {
        this.calendarRepository = calendarRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    //view all events in calendar
    public List<EventSummaryDTO> getAllEvents(Long userId) {
        List<Event> events = calendarRepository.findByUserId(userId);

        return events.stream()
                .map(EventMapper::mapToEventSummaryDto)
                .toList();
    }

    //view events between certain dates in calendar
    public List<EventSummaryDTO> getEventsByDateRange (Long userId, LocalDateTime start, LocalDateTime end) {
        List<Event> events = calendarRepository.findByUserIdAndStartTimeBetween(userId, start, end);
        return events.stream()
                .map(EventMapper::mapToEventSummaryDto)
                .toList();
    }

    //view detailed information of specific event
    public EventDTO getEventById(Long userId, Long id) {
        Event event = calendarRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Event"));
        return EventMapper.mapToEventDto(event);
    }

    //create new event
    public EventDTO createEvent(Long userId, CreateEventDTO createEventDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User"));

        Event event = EventMapper.mapToEventEntity(createEventDTO);

        if (createEventDTO.getIsAllDay()) {

            LocalDateTime start =
                    createEventDTO.getStartTime()
                            .toLocalDate()
                            .atStartOfDay();

            event.setStartTime(start);

            event.setEndTime(
                    start.toLocalDate()
                            .plusDays(1)
                            .atStartOfDay()
            );
        }

        event.setUser(user);
        event.setCreatedAt(LocalDateTime.now());

        // Validates that end time is not before start time
        if (createEventDTO.getStartTime() != null &&
                createEventDTO.getEndTime() != null &&
                createEventDTO.getEndTime().isBefore(createEventDTO.getStartTime())) {
            throw new InvalidEventException("End time cannot be before start time");
        }

        //sets category if it exists
        if (createEventDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(createEventDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category"));
            event.setCategory(category);
        }

        //if isRecurring is true, frequency must be set.
        if (createEventDTO.getIsRecurring()) {
            if (createEventDTO.getFrequency() == null) {
                throw new InvalidEventException("Frequency must be set when event is recurring");
            }
            // Validates frequency value even though frontend restricts input via dropdown.
            // Guards against direct API calls (e.g. via Postman) with invalid values.
            try {
                event.setFrequency(Frequency.valueOf(createEventDTO.getFrequency().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new InvalidEventException("Invalid frequency: " + createEventDTO.getFrequency() + ". Must be DAILY, WEEKLY, MONTHLY or YEARLY");
            }
        }

        Event savedEvent = calendarRepository.save(event);
        return EventMapper.mapToEventDto(savedEvent);
    }


    //delete event
    public void deleteEvent(Long eventId, Long userId) {

        Event event = calendarRepository.findByIdAndUserId(eventId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Event"));

        calendarRepository.delete(event);
    }

    //update event
    public EventDTO updateEvent(Long eventId, Long userId, UpdateEventDTO updateEventDTO) {

        Event event = calendarRepository.findByIdAndUserId(eventId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Event"));

        boolean contentWasUpdated = false;

        if (updateEventDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(updateEventDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category"));
            event.setCategory(category);
        }

        if (updateEventDTO.getTitle() != null) {
            event.setTitle(updateEventDTO.getTitle());
            contentWasUpdated = true;
        }
        if (updateEventDTO.getDescription() != null) {
            event.setDescription(updateEventDTO.getDescription());
            contentWasUpdated = true;
        }
        if (updateEventDTO.getStartTime() != null) {
            event.setStartTime(updateEventDTO.getStartTime());
            contentWasUpdated = true;
        }
        if (updateEventDTO.getEndTime() != null) {
            event.setEndTime(updateEventDTO.getEndTime());
            contentWasUpdated = true;
        }

        // Validates that end time is not before start time
        if (event.getEndTime() != null && event.getEndTime().isBefore(event.getStartTime())) {
            throw new InvalidEventException("End time cannot be before start time");
        }

        if (updateEventDTO.getLocation() != null) {
            event.setLocation(updateEventDTO.getLocation());
            contentWasUpdated = true;
        }
        if (updateEventDTO.getIsAllDay() != null) {
            event.setIsAllDay(updateEventDTO.getIsAllDay());
            contentWasUpdated = true;
        }
        if (updateEventDTO.getIsRecurring() != null) {
            event.setIsRecurring(updateEventDTO.getIsRecurring());
            contentWasUpdated = true;
        }
        if (updateEventDTO.getFrequency() != null) {
            // Validates frequency value even though frontend restricts input via dropdown.
            // Guards against direct API calls (e.g. via Postman) with invalid values.
            try {
                event.setFrequency(Frequency.valueOf(updateEventDTO.getFrequency().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new InvalidEventException("Invalid frequency: " + updateEventDTO.getFrequency() + ". Must be DAILY, WEEKLY, MONTHLY or YEARLY");
            }
            contentWasUpdated = true;
        }
        if (updateEventDTO.getIntervalValue() != null) {
            event.setIntervalValue(updateEventDTO.getIntervalValue());
            contentWasUpdated = true;
        }

        if (contentWasUpdated){
            event.setUpdatedAt(LocalDateTime.now());
        }

        Event updatedEvent = calendarRepository.save(event);

        return EventMapper.mapToEventDto(updatedEvent);
    }
}