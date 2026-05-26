package com.example.taskgoblin.exception;

public class ResourceNotFoundException extends RuntimeException {

    // Automatically creates messages like:
    // "User not found"
    // "Note not found"
    public ResourceNotFoundException(String resource) {
        super(resource + " not found");
    }
}