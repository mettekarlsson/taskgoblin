package com.example.taskgoblin.controller;

import com.example.taskgoblin.dto.CategoryDTO;
import com.example.taskgoblin.dto.CreateCategoryDTO;
import com.example.taskgoblin.dto.NoteDTO;
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


}
