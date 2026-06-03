package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.CreateEventDTO;
import com.example.taskgoblin.dto.EventDTO;
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

    //view all events
    public List<EventDTO> getAllEvents(Long userId) {
        List<Event> events = calendarRepository.findByUserId(userId);

        return events.stream()
                .map(EventMapper::mapToEventDto)
                .toList();
    }

    //create new event
    public EventDTO createEvent(Long userId, CreateEventDTO createEventDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User"));

        Event event = EventMapper.mapToEventEntity(createEventDTO);
        event.setUser(user);
        event.setCreatedAt(LocalDateTime.now());

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
            event.setFrequency(Frequency.valueOf(createEventDTO.getFrequency().toUpperCase()));
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
            event.setFrequency(Frequency.valueOf(updateEventDTO.getFrequency().toUpperCase()));
            contentWasUpdated = true;
        }
        if (updateEventDTO.getIntervalValue() != null) {
            event.setIntervalValue(updateEventDTO.getIntervalValue());
            contentWasUpdated = true;
        }

        if (contentWasUpdated == true){
            event.setUpdatedAt(LocalDateTime.now());
        }

        Event updatedEvent = calendarRepository.save(event);

        return EventMapper.mapToEventDto(updatedEvent);
    }
}