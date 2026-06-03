package com.example.taskgoblin.repository;

import com.example.taskgoblin.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    // findByUserId(Long userId)
    // Returns all notes that belong to a specific user.
    //
    // This ensures users only receive their own notes.

    List<Note> findByUserId(Long userId);

    // findByIdAndUserId(Long id, Long userId)
    // Finds a note by both note ID and user ID.
    //
    // This adds an extra security check to make sure
    // the requested note belongs to the correct user.

    Optional<Note> findByIdAndUserId(Long id, Long userId);

    void deleteByUserId(Long userId);

}

