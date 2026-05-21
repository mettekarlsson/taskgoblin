package com.example.taskgoblin.controller;

import com.example.taskgoblin.dto.UserProfileDTO;
import com.example.taskgoblin.model.User;
import com.example.taskgoblin.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getProfile() {
        Long hardcodedUserId = 1L; // placeholder tills inloggning är klar
        //kommer sen se ut såhär istället:
        //Long id = securityContext.getAuthenticatedUser().getId();
        return ResponseEntity.ok(userService.getProfile(hardcodedUserId));
    }

}