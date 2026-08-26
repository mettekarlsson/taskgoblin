package com.example.taskgoblin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateCategoryDTO {

    @Size(max = 100, message = "Name cannot be longer than 100 characters.")
    @NotBlank(message = "Name cannot be empty.")
    private String name;

    private String color;

    private String icon;

    public CreateCategoryDTO() {
    }

    public CreateCategoryDTO(String name, String color, String icon) {
        this.name = name;
        this.color = color;
        this.icon = icon;

    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }
}
