package com.example.taskgoblin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Validation constraints check that user input is valid
// before the data reaches the service layer or database.
//
// - @NotBlank prevents empty content
// - @Size limits how long the title can be
//
// This helps protect the application from invalid data.

public class CreateNoteDTO {

    @Size(max = 200, message = "Title cannot be longer than 200 characters.")
    private String title;

    @NotBlank(message = "Content cannot be empty.")
    private String content;

    private String color;

    public CreateNoteDTO(String title, String content, String color) {
        this.title = title;
        this.content = content;
        this.color = color;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
