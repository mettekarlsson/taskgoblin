package com.example.taskgoblin.controller;

import com.example.taskgoblin.dto.UserProfileDTO;
import com.example.taskgoblin.dto.UserSettingsDTO;
import com.example.taskgoblin.service.UserService;
import com.example.taskgoblin.service.UserSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;
    private final UserSettingsService userSettingsService;

    public UserController(UserService userService, UserSettingsService userSettingsService) {
        this.userService = userService;
        this.userSettingsService = userSettingsService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getProfile() {
        Long hardcodedUserId = 1L; // placeholder tills inloggning är klar
        //kommer sen se ut såhär istället:
        //Long id = securityContext.getAuthenticatedUser().getId();
        return ResponseEntity.ok(userService.getProfile(hardcodedUserId));
    }

    @GetMapping("/settings")
    public ResponseEntity<UserSettingsDTO> getUserSettings() {
        Long hardcodedUserId = 1L; // placeholder tills inloggning är klar
        return ResponseEntity.ok(userSettingsService.getUserSettings(hardcodedUserId));
    }

}