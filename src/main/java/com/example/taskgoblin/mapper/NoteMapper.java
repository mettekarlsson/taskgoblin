package com.example.taskgoblin.mapper;

import com.example.taskgoblin.dto.NoteDTO;
import com.example.taskgoblin.model.Note;

public class NoteMapper {

    public static NoteDTO mapToNoteDto(Note note) {
        return new NoteDTO(
                note.getTitle(),
                note.getContent(),
                note.getColor(),
                note.isPinned(),
                note.getCreatedAt(),
                note.getLastInteractedAt()
        );
    }

}

