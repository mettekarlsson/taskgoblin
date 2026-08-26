package com.example.taskgoblin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateNoteDTO {

    @Size(max = 200, message = "Title cannot be longer than 200 characters.")
    private String title;

    @NotBlank(message = "Content cannot be empty.")
    private String content;

    private String color;

    private Boolean pinned;

    public UpdateNoteDTO() {
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public String getColor() {
        return color;
    }

    public Boolean getPinned() {
        return pinned;
    }
}