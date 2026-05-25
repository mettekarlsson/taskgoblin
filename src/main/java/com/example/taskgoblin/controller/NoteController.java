package com.example.taskgoblin.controller;

import com.example.taskgoblin.dto.NoteDTO;
import com.example.taskgoblin.service.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    // GET /notes
    @GetMapping
    public ResponseEntity<List<NoteDTO>> getAllNotes() {
        Long hardcodedUserId = 1L; // placeholder tills inloggning är klar
        return ResponseEntity.ok(noteService.getAllNotes(hardcodedUserId));

    }

    // GET /notes/1
    @GetMapping("/{id}")
    public ResponseEntity<NoteDTO> getNote(@PathVariable Long id) {
        Long hardcodedUserId = 1L; // placeholder tills inloggning är klar
        return ResponseEntity.ok(noteService.getNote(id, hardcodedUserId));
    }


}
