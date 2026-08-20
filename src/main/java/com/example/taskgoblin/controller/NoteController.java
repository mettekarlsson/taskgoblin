package com.example.taskgoblin.controller;

import com.example.taskgoblin.dto.CreateNoteDTO;
import com.example.taskgoblin.dto.NoteDTO;
import com.example.taskgoblin.dto.UpdateNoteDTO;
import com.example.taskgoblin.service.NoteService;
import com.example.taskgoblin.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notes")
public class NoteController {

    private final NoteService noteService;
    private final UserService userService;

    public NoteController(NoteService noteService, UserService userService) {
        this.noteService = noteService;
        this.userService = userService;
    }

    // GET /notes
    @GetMapping
    public ResponseEntity<List<NoteDTO>> getAllNotes(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(noteService.getAllNotes(userId));
    }
    // @PathVariable takes a value directly from the URL.
    //
    // Example:
    // GET /notes/1
    // The value "1" is automatically stored in the id parameter.

    // GET /notes/1
    @GetMapping("/{id}")
    public ResponseEntity<NoteDTO> getNote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(noteService.getNote(id, userId));
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
    public ResponseEntity<NoteDTO> addNote(
            @Valid @RequestBody CreateNoteDTO createNoteDto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(noteService.createNote(userId, createNoteDto));
    }

    // DELETE /notes/1
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        noteService.deleteNote(id, userId);
        return ResponseEntity.noContent().build();
    }

    // PATCH (partial update) /notes/1
    @PatchMapping("/{id}")
    public ResponseEntity<NoteDTO> updateNote(
            @PathVariable Long id,
            @RequestBody UpdateNoteDTO updateNoteDTO,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(
                noteService.updateNote(id, userId, updateNoteDTO)
        );
    }

}
