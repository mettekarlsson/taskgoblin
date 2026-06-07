package com.example.taskgoblin.mapper;

import com.example.taskgoblin.dto.CategoryDTO;
import com.example.taskgoblin.dto.CreateCategoryDTO;
import com.example.taskgoblin.model.Category;


public class CategoryMapper {

        //mapping from entity to dto
        public static CategoryDTO mapToCategoryDto(Category category) {
            return new CategoryDTO(
                    category.getId(),
                    category.getName(),
                    category.getColor(),
                    category.getIcon()
            );
        }

        //mapping from dto to entity
        public static Category mapToCategoryEntity(CreateCategoryDTO createCategoryDTO) {

            Category category = new Category();

            category.setName(createCategoryDTO.getName());
            category.setColor(createCategoryDTO.getColor());
            category.setIcon(createCategoryDTO.getIcon());

            return category;
        }
}



