package com.example.taskgoblin.mapper;

import com.example.taskgoblin.dto.CategoryDTO;
import com.example.taskgoblin.dto.CreateEventDTO;
import com.example.taskgoblin.dto.EventDTO;
import com.example.taskgoblin.dto.EventSummaryDTO;
import com.example.taskgoblin.model.Event;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {

    //map from entity to dto
    public EventDTO mapToEventDto(Event event) {

        CategoryDTO categoryDTO = null;
        if (event.getCategory() != null) {
            categoryDTO = new CategoryDTO(
                    event.getCategory().getId(),
                    event.getCategory().getName(),
                    event.getCategory().getColor(),
                    event.getCategory().getIcon()
            );
        }

        return new EventDTO(
                event.getId(),
                categoryDTO,
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

    //map to entity from dto
    public Event mapToEventEntity(CreateEventDTO createEventDTO) {
    Event event = new Event();

        event.setTitle(createEventDTO.getTitle());
        event.setDescription(createEventDTO.getDescription());
        event.setStartTime(createEventDTO.getStartTime());
        event.setEndTime(createEventDTO.getEndTime());
        event.setLocation(createEventDTO.getLocation());
        event.setIsAllDay(createEventDTO.getIsAllDay());
        event.setIsRecurring(createEventDTO.getIsRecurring());
        event.setIntervalValue(createEventDTO.getIntervalValue());

        return event;
}

//map from entity to eventsummarydto
    public EventSummaryDTO mapToEventSummaryDto(Event event) {

        String color = null;
        if (event.getCategory() != null) {
            color = event.getCategory().getColor();
        }

        return new EventSummaryDTO(
                event.getId(),
                event.getTitle(),
                event.getStartTime(),
                event.getEndTime(),
                event.getIsAllDay(),
                color
        );
    }

}