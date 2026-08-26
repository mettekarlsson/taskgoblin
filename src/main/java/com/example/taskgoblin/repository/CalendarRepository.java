package com.example.taskgoblin.repository;

import com.example.taskgoblin.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CalendarRepository extends JpaRepository<Event, Long> {

    Optional<Event> findByIdAndUserId(Long eventId, Long userId);

    void deleteByUserId(Long userId);

    List<Event> findByUserIdAndStartTimeLessThanEqual(Long userId, LocalDateTime end);

    List<Event> findByUserIdAndTitleContainingIgnoreCase(Long userId, String query);
}
