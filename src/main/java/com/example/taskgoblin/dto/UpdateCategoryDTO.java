package com.example.taskgoblin.dto;

import jakarta.validation.constraints.Size;

public class UpdateCategoryDTO {

    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    private String color;

    private String icon;

    public UpdateCategoryDTO() {
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
