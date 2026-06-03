package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.EventDTO;
import com.example.taskgoblin.dto.NoteDTO;
import com.example.taskgoblin.mapper.EventMapper;
import com.example.taskgoblin.mapper.NoteMapper;
import com.example.taskgoblin.model.Event;
import com.example.taskgoblin.model.Note;
import com.example.taskgoblin.repository.CalendarRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CalendarService {

    private final CalendarRepository calendarRepository;

    public CalendarService(CalendarRepository calendarRepository) {
        this.calendarRepository = calendarRepository;
    }

    public List<EventDTO> getAllEvents(Long id) {
        List<Event> events = calendarRepository.findByUserId(id);

        return events.stream()
                .map(EventMapper::mapToEventDto)
                .toList();
    }
}
