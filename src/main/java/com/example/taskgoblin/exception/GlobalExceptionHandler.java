package com.example.taskgoblin.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.stream.Collectors;

@ControllerAdvice
// Handles exceptions globally across the entire application.
public class GlobalExceptionHandler {

    // Used to log unexpected exceptions on the server, since we don't
    // send their details back to the client (see handleGeneric below).
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

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


    @ExceptionHandler(AlreadyCompletedException.class)
    public ResponseEntity<ErrorResponse> handleAlreadyCompletedException(
            AlreadyCompletedException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(
                        HttpStatus.CONFLICT.value(),
                        ex.getMessage()
                ));
    }

    @ExceptionHandler(AlreadyOpenException.class)
    public ResponseEntity<ErrorResponse> handleAlreadyOpenException(
            AlreadyOpenException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(
                        HttpStatus.CONFLICT.value(),
                        ex.getMessage()
                ));
    }

    @ExceptionHandler(InvalidEventException.class)
    public ResponseEntity<ErrorResponse> handleInvalidEvent(
            InvalidEventException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        HttpStatus.BAD_REQUEST.value(),
                        ex.getMessage()
                ));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    // Runs when a required @RequestParam is missing entirely.
    // Example: GET /calendar without startDate.
    public ResponseEntity<ErrorResponse> handleMissingParam(
            MissingServletRequestParameterException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        HttpStatus.BAD_REQUEST.value(),
                        "Missing required parameter: " + ex.getParameterName()
                ));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    // Runs when a @RequestParam is present but can't be parsed into the
    // expected type. Example: GET /calendar?startDate=igår
    public ResponseEntity<ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        HttpStatus.BAD_REQUEST.value(),
                        "Invalid value for parameter: " + ex.getName()
                ));
    }

    // Catch-all: runs only when none of the more specific handlers above match.
    // Spring picks the closest matching handler by exception type automatically,
    // so this doesn't "steal" exceptions meant for the handlers above it.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(
            Exception ex
    ) {
        // Log the real exception server-side for debugging...
        logger.error("Unhandled exception", ex);

        // ...but never expose its details (message, stacktrace) to the client.
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "Something went wrong"
                ));
    }
}