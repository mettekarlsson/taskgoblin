package com.example.taskgoblin.dto;

public class CategoryDTO {

    private Long id;
    private String name;
    private String color;
    private String icon;


    public CategoryDTO () {
    }

    public CategoryDTO(Long id, String name, String color, String icon) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.icon = icon;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getColor() {
        return color;
    }

    public String getIcon() {
        return icon;
    }
}
