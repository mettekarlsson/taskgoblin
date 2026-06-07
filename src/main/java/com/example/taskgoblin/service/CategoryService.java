package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.CategoryDTO;
import com.example.taskgoblin.dto.CreateCategoryDTO;
import com.example.taskgoblin.dto.NoteDTO;
import com.example.taskgoblin.exception.ResourceNotFoundException;
import com.example.taskgoblin.mapper.CategoryMapper;
import com.example.taskgoblin.mapper.NoteMapper;
import com.example.taskgoblin.model.Category;
import com.example.taskgoblin.model.Note;
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

    /*
     * Constructor injection
     */
    public CategoryService(
            UserRepository userRepository,
            CategoryRepository categoryRepository
    ) {

        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    /*
     * Read operations
     */

    // Returns a specific category for a user
    public CategoryDTO getCategory(Long categoryId, Long userId) {
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category"));

        return CategoryMapper.mapToCategoryDto(category);
    }

    // Returns all categories for a user
    public List<CategoryDTO> getAllCategories(Long userId) {
        List<Category> categories = categoryRepository.findByUserId(userId);

        return categories.stream()
                .map(CategoryMapper::mapToCategoryDto)
                .toList();
    }

     /*
     * Create
     */

    // Creates and saves a new category for a specific user.
    public CategoryDTO createCategory(Long userId, CreateCategoryDTO createCategoryDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User"));
        Category category = CategoryMapper.mapToCategoryEntity(createCategoryDto);
        category.setUser(user);

        Category savedCategory = categoryRepository.save(category);
        return CategoryMapper.mapToCategoryDto(savedCategory);
    }

}
