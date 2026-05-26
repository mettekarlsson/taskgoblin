package com.example.taskgoblin.controller;

import com.example.taskgoblin.dto.CreateNoteDTO;
import com.example.taskgoblin.dto.NoteDTO;
import com.example.taskgoblin.dto.UpdateNoteDTO;
import com.example.taskgoblin.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // @PathVariable takes a value directly from the URL.
    //
    // Example:
    // GET /notes/1
    // The value "1" is automatically stored in the id parameter.

    // GET /notes/1
    @GetMapping("/{id}")
    public ResponseEntity<NoteDTO> getNote(@PathVariable Long id) {
        Long hardcodedUserId = 1L; // placeholder tills inloggning är klar
        return ResponseEntity.ok(noteService.getNote(id, hardcodedUserId));
    }
    // @Valid checks that the incoming request body follows
    // the validation constraints defined in CreateNoteDTO.
    //
    // Example:
    // - @NotBlank prevents empty content
    // - @Size limits title length
    //
    // If validation fails, Spring automatically returns an error response.

    // POST (create) /notes
    @PostMapping
    public ResponseEntity<NoteDTO> addNote(@Valid @RequestBody CreateNoteDTO createNoteDto) {
        Long hardcodedUserId = 1L;

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(noteService.createNote(hardcodedUserId, createNoteDto));
    }

    // DELETE /notes/1
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNote(@PathVariable Long id) {

        Long hardcodedUserId = 1L;

        noteService.deleteNote(id, hardcodedUserId);

        return ResponseEntity.ok("Note deleted successfully");
    }

    // PUT (update) /notes/1
    @PutMapping("/{id}")
    public ResponseEntity<NoteDTO> updateNote(
            @PathVariable Long id,
            @Valid @RequestBody UpdateNoteDTO updateNoteDTO
    ) {
        Long hardcodedUserId = 1L;

        return ResponseEntity.ok(
                noteService.updateNote(id, hardcodedUserId, updateNoteDTO)
        );
    }

}
