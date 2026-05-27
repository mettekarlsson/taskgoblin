package com.example.taskgoblin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UserProfileDTO {

    @Pattern(
            regexp = "^[\\p{L}]+(?: [\\p{L}]+)+$",
            message = "Name must contain only letters and include first and last name"
    )
    @Size(min = 2, max = 100,
            message = "Name must be between 2 and 100 characters")
    private String name;

    @Email(message = "Email must be valid")
    @Size(max = 255,
            message = "Email cannot exceed 255 characters")
    private String email;

    public UserProfileDTO() {
    }

    public UserProfileDTO(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

}
