package com.example.taskgoblin.mapper;

import com.example.taskgoblin.dto.EventDTO;
import com.example.taskgoblin.model.Event;

public class EventMapper {

    public static EventDTO mapToEventDto(Event event) {
        return new EventDTO(
                event.getId(),
                event.getCategory(),
                event.getTitle(),
                event.getDescription(),
                event.getStartTime(),
                event.getEndTime(),
                event.getLocation(),
                event.getIsAllDay(),
                event.getIsRecurring(),
                event.getFrequency(),
                event.getIntervalValue()

        );
    }
}