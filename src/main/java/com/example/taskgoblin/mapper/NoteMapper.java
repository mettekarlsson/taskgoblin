package com.example.taskgoblin.mapper;

import com.example.taskgoblin.dto.CreateNoteDTO;
import com.example.taskgoblin.dto.NoteDTO;
import com.example.taskgoblin.model.Note;
import org.springframework.stereotype.Component;

@Component
public class NoteMapper {

    //mapping from entity to dto
    public NoteDTO mapToNoteDto(Note note) {
        return new NoteDTO(
                note.getId(),
                note.getTitle(),
                note.getContent(),
                note.getColor(),
                note.isPinned(),
                note.getCreatedAt(),
                note.getLastInteractedAt()
        );
    }

    //mapping from dto to entity
    public Note mapToNoteEntity(CreateNoteDTO createNoteDto) {

        Note note = new Note();

        note.setTitle(createNoteDto.getTitle());
        note.setContent(createNoteDto.getContent());
        note.setColor(createNoteDto.getColor());

        return note;
    }
}

