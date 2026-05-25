package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.CreateNoteDTO;
import com.example.taskgoblin.dto.NoteDTO;
import com.example.taskgoblin.mapper.NoteMapper;
import com.example.taskgoblin.model.Note;
import com.example.taskgoblin.model.User;
import com.example.taskgoblin.repository.NoteRepository;
import com.example.taskgoblin.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    public NoteService(NoteRepository noteRepository, UserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
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

    public NoteDTO createNote(Long userId, CreateNoteDTO createNoteDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Note note = NoteMapper.mapToNoteEntity(createNoteDto);
        note.setUser(user);
        note.setCreatedAt(LocalDateTime.now());
        note.setPinned(false);
        Note savedNote = noteRepository.save(note);
        return NoteMapper.mapToNoteDto(savedNote);
    }
}
