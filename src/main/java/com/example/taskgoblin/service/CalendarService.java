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

import java.time.Duration;
import java.util.ArrayList;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CalendarService {

    private final CalendarRepository calendarRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final EventMapper eventMapper;

    public CalendarService(CalendarRepository calendarRepository, UserRepository userRepository, CategoryRepository categoryRepository, EventMapper eventMapper) {
        this.calendarRepository = calendarRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.eventMapper = eventMapper;
    }

    //view events between certain dates in calendar
    public List<EventSummaryDTO> getEventsByDateRange (Long userId, LocalDateTime start, LocalDateTime end) {
        List<Event> events = calendarRepository.findByUserIdAndStartTimeLessThanEqual(userId, end);
        List<EventSummaryDTO> result = new ArrayList<>();

        for (Event event : events) {
            if (Boolean.FALSE.equals(event.getIsRecurring()) && !event.getStartTime().isBefore(start)) {
                result.add(eventMapper.mapToEventSummaryDto(event));
            }
            else if (Boolean.TRUE.equals(event.getIsRecurring())) {
                result.addAll(expandRecurringEvent(event, start, end));
            }
        }
        return result;
    }

    //method for recurring events
    private List<EventSummaryDTO> expandRecurringEvent(Event event, LocalDateTime windowStart, LocalDateTime windowEnd) {
        List<EventSummaryDTO> occurrences = new ArrayList<>();
        LocalDateTime occurrenceStart = event.getStartTime(); //the "original" event's start time

        while (!occurrenceStart.isAfter(windowEnd)) {
            if (!occurrenceStart.isBefore(windowStart)) {
               EventSummaryDTO dto = eventMapper.mapToEventSummaryDto(event);
               //update the dto's start time (for next occurrance)
                dto.setStartTime(occurrenceStart);
                //if event has an end time - update it too
                if (event.getEndTime() != null) {
                    Duration duration = Duration.between(event.getStartTime(), event.getEndTime());
                    LocalDateTime newEndTime = occurrenceStart.plus(duration);
                    dto.setEndTime(newEndTime);
                }
                occurrences.add(dto);
            }
            //update occurrencestart to the next occurrence
            //if intervalvalue isn't null - step takes it's value, if it's null - step is 1
            int step = (event.getIntervalValue() != null) ? event.getIntervalValue() : 1;
            occurrenceStart = switch (event.getFrequency()) {
                case DAILY -> occurrenceStart.plusDays(step);
                case WEEKLY -> occurrenceStart.plusWeeks(step);
                case MONTHLY -> occurrenceStart.plusMonths(step);
                case YEARLY -> occurrenceStart.plusYears(step);
            };
        }

        return occurrences;
    }

    //view detailed information of specific event
    public EventDTO getEventById(Long userId, Long id) {
        Event event = calendarRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Event"));
        return eventMapper.mapToEventDto(event);
    }

    //create new event
    public EventDTO createEvent(Long userId, CreateEventDTO createEventDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User"));

        Event event = eventMapper.mapToEventEntity(createEventDTO);

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
            Category category = categoryRepository.findByIdAndUserId(createEventDTO.getCategoryId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category"));
            event.setCategory(category);
        }

        //if isRecurring is true, frequency must be set.
        if (createEventDTO.getIsRecurring()) {
            if (createEventDTO.getFrequency() == null) {
                throw new InvalidEventException("Frequency must be set when event is recurring");
            }

            // Recurring events must repeat at some positive interval (e.g. "every 2 weeks").
            // null or non-positive values would make the occurrence loop in expandRecurringEvent
            // either crash or never advance (infinite loop).
            if (createEventDTO.getIntervalValue() == null || createEventDTO.getIntervalValue() <= 0) {
                throw new InvalidEventException("Interval value must be set to a positive number when event is recurring");
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
        return eventMapper.mapToEventDto(savedEvent);
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
            Category category = categoryRepository.findByIdAndUserId(updateEventDTO.getCategoryId(), userId)
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

        // Checked on the event's final state (not just the DTO) because this is a
        // PATCH - isRecurring, frequency and intervalValue might have been set in
        // an earlier request, not this one. This also catches a PATCH that flips
        // isRecurring to true without supplying a valid frequency/intervalValue.
        if (Boolean.TRUE.equals(event.getIsRecurring())) {
            if (event.getFrequency() == null) {
                throw new InvalidEventException("Frequency must be set when event is recurring");
            }
            if (event.getIntervalValue() == null || event.getIntervalValue() <= 0) {
                throw new InvalidEventException("Interval value must be set to a positive number when event is recurring");
            }
        }

        if (contentWasUpdated){
            event.setUpdatedAt(LocalDateTime.now());
        }

        Event updatedEvent = calendarRepository.save(event);

        return eventMapper.mapToEventDto(updatedEvent);
    }
}