package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.*;
import com.example.taskgoblin.exception.ResourceNotFoundException;
import com.example.taskgoblin.mapper.CategoryMapper;
import com.example.taskgoblin.model.Category;
import com.example.taskgoblin.model.User;
import com.example.taskgoblin.repository.CategoryRepository;
import com.example.taskgoblin.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class CategoryService {

    /*
     * Repositories
     */
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    /*
     * Constructor injection
     */
    public CategoryService(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            CategoryMapper categoryMapper
    ) {

        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    /*
     * Read operations
     */

    // Returns a specific category for a user
    public CategoryDTO getCategory(Long categoryId, Long userId) {
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category"));

        return categoryMapper.mapToCategoryDto(category);
    }

    // Returns all categories for a user
    public List<CategoryDTO> getAllCategories(Long userId) {
        List<Category> categories = categoryRepository.findByUserId(userId);

        return categories.stream()
                .map(categoryMapper::mapToCategoryDto)
                .toList();
    }

     /*
     * Create operations
     */

    // Creates and saves a new category for a specific user.
    public CategoryDTO createCategory(Long userId, CreateCategoryDTO createCategoryDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User"));
        Category category = categoryMapper.mapToCategoryEntity(createCategoryDto);
        category.setUser(user);

        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.mapToCategoryDto(savedCategory);
    }

    /*
     * Update operations
     */

    // Updates a category for a specific user.
    public CategoryDTO updateCategory(
            Long categoryId,
            UpdateCategoryDTO dto,
            Long userId
    ) {

        // Fetches the category that belongs to the current user.
        // Prevents users from updating categories they do not own.
        Category category = categoryRepository
                .findByIdAndUserId(categoryId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category"));

        // Updates the category only if a new value was provided.
        if (dto.getName() != null) {
            category.setName(dto.getName());
        }

        // Updates the color if provided.
        if (dto.getColor() != null) {
            category.setColor(dto.getColor());
        }

        // Updates the icon if provided.
        if (dto.getIcon() != null) {
            category.setIcon(dto.getIcon());
        }

        // Saves the updated category.
        Category updatedCategory =
                categoryRepository.save(category);

        // Converts the updated entity into a response DTO.
        return categoryMapper
                .mapToCategoryDto(updatedCategory);
    }


    /*
     * Delete operations
     */

    // Deletes a category for a specific user.
    public void deleteCategory(Long categoryId, Long userId) {

        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category"));

        categoryRepository.delete(category);
    }

}
