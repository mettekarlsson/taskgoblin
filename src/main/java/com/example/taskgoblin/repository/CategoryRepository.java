package com.example.taskgoblin.repository;

import com.example.taskgoblin.model.Category;
import com.example.taskgoblin.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository
        extends JpaRepository<Category, Long> {

    List<Category> findByUserId(Long userId);

    /*
     Finds a category by id that belongs
     to a specific user.

     Prevents users from accessing
     categories owned by other users.
    */
    Optional<Category> findByIdAndUserId(
            Long id,
            Long userId
    );
}
