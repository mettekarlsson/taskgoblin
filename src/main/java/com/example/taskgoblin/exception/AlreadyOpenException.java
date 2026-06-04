package com.example.taskgoblin.exception;

public class AlreadyOpenException extends RuntimeException {
    public AlreadyOpenException(String message) {
        super(message);
    }
}
