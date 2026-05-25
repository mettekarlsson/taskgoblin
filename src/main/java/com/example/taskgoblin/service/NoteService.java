package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.NoteDTO;
import com.example.taskgoblin.mapper.NoteMapper;
import com.example.taskgoblin.model.Note;
import com.example.taskgoblin.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    public List<NoteDTO> getAllNotes(Long id) {
        List<Note> notes = noteRepository.findByUserId(id);

        return notes.stream()
                .map(NoteMapper::mapToNoteDto)
                .toList();
    }

    public NoteDTO getNote(Long id, Long userId) {
        Note note = noteRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        return NoteMapper.mapToNoteDto(note);
    }
}
