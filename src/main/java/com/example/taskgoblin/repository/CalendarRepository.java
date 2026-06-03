package com.example.taskgoblin.repository;

import com.example.taskgoblin.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CalendarRepository extends JpaRepository {

    List<Event> findByUserId(Long userId);

}
