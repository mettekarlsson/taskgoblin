package com.example.taskgoblin.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import java.util.stream.Collectors;

@ControllerAdvice
// Handles exceptions globally across the entire application.
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    // Runs when a requested resource does not exist.
    // Example:
    // "Note not found"
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(
                        HttpStatus.NOT_FOUND.value(),
                        ex.getMessage()
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    // Handles validation errors from DTOs using @Valid.
    // Example:
    // - empty content
    // - title longer than allowed
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex
    ) {

        // Collects all validation errors into one readable message.
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        HttpStatus.BAD_REQUEST.value(),
                        message
                ));
    }

    @ExceptionHandler(InvalidDueDateException.class)
    public ResponseEntity<ErrorResponse> handleInvalidDueDate(
            InvalidDueDateException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        HttpStatus.BAD_REQUEST.value(),
                        ex.getMessage()
                ));
    }

    @ExceptionHandler(ResponseStatusException.class)
    // Handles custom status errors thrown from the service layer.
    // Example: "Email is already in use"
    public ResponseEntity<ErrorResponse> handleResponseStatusException(
            ResponseStatusException ex
    ) {
        return ResponseEntity
                .status(ex.getStatusCode())
                .body(new ErrorResponse(
                        ex.getStatusCode().value(),
                        ex.getReason()
                ));
    }

    @ExceptionHandler(InvalidRecurringTaskException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRecurringTask(
            InvalidRecurringTaskException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        HttpStatus.BAD_REQUEST.value(),
                        ex.getMessage()
                ));
    }

    @ExceptionHandler(TaskAlreadyCompletedException.class)
    public ResponseEntity<String> handleTaskAlreadyCompletedException(
            TaskAlreadyCompletedException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ex.getMessage());
    }
}