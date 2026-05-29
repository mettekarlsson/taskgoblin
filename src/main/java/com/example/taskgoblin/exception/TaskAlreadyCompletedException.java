package com.example.taskgoblin.exception;

public class TaskAlreadyCompletedException
        extends RuntimeException {

    public TaskAlreadyCompletedException(String message) {
        super(message);
    }
}