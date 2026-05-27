package com.example.taskgoblin.exception;

public class InvalidDueDateException extends RuntimeException {

    public InvalidDueDateException(String message) {
        super(message);
    }
}