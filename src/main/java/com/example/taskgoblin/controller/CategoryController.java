package com.example.taskgoblin.controller;

import com.example.taskgoblin.dto.*;
import com.example.taskgoblin.service.CategoryService;
import com.example.taskgoblin.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    /*
     * Services
     */

    private final UserService userService;
    private final CategoryService categoryService;

    /*
     * Constructor injection
     */
    public CategoryController(
            UserService userService,
            CategoryService categoryService
    ) {

        this.userService = userService;
        this.categoryService = categoryService;
    }

    /*
     * Read operations
     */

    // Returns a specific category for the authenticated user
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(categoryService.getCategory(id, userId));
    }

    // Returns all categories for the authenticated user
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(categoryService.getAllCategories(userId));
    }

    /*
     * Create operations
     */
    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(
            @Valid @RequestBody CreateCategoryDTO createCategoryDTO,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.createCategory(userId, createCategoryDTO));
    }

    /*
     * Update operations
     */

    // PATCH/categories/{id}
    @PatchMapping("/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryDTO dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Long userId = userService
                .getUserByEmail(userDetails.getUsername())
                .getId();

        CategoryDTO updatedCategory =
                categoryService.updateCategory(id, dto, userId);

        return ResponseEntity.ok(updatedCategory);
    }


    /*
     * Delete operations
     */

    // DELETE /categories/1
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        categoryService.deleteCategory(id, userId);
        return ResponseEntity.noContent().build();
    }
}
