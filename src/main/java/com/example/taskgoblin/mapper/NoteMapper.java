package com.example.taskgoblin.mapper;

import com.example.taskgoblin.dto.CreateNoteDTO;
import com.example.taskgoblin.dto.NoteDTO;
import com.example.taskgoblin.model.Note;

public class NoteMapper {

    //mapping from entity to dto
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

    //mapping from dto to entity
    public static Note mapToNoteEntity(CreateNoteDTO createNoteDto) {

        Note note = new Note();

        note.setTitle(createNoteDto.getTitle());
        note.setContent(createNoteDto.getContent());
        note.setColor(createNoteDto.getColor());

        return note;
    }
}

