package com.example.taskgoblin.exception;

public class AlreadyCompletedException extends RuntimeException {
    public AlreadyCompletedException(String message) {
        super(message);
    }
}
