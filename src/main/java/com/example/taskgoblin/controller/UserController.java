package com.example.taskgoblin.controller;

import jakarta.validation.Valid;
import com.example.taskgoblin.dto.UserProfileDTO;
import com.example.taskgoblin.dto.UserSettingsDTO;
import com.example.taskgoblin.service.UserService;
import com.example.taskgoblin.service.UserSettingsService;
import org.springframework.http.ResponseEntity;
import com.example.taskgoblin.dto.ChangePasswordDTO;
import org.springframework.web.bind.annotation.*;

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

    @PatchMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateProfile(
            @Valid @RequestBody UserProfileDTO userProfileDTO
    ) {
        Long hardcodedUserId = 1L;

        return ResponseEntity.ok(
                userService.updateProfile(hardcodedUserId, userProfileDTO)
        );
    }

    @PutMapping("/password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordDTO changePasswordDTO
    ) {
        Long hardcodedUserId = 1L;

        userService.changePassword(hardcodedUserId, changePasswordDTO);

        return ResponseEntity.ok("Password changed successfully");
    }

    @GetMapping("/settings")
    public ResponseEntity<UserSettingsDTO> getUserSettings() {
        Long hardcodedUserId = 1L; // placeholder tills inloggning är klar
        return ResponseEntity.ok(userSettingsService.getUserSettings(hardcodedUserId));
    }

}