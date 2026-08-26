package com.example.taskgoblin.controller;

import jakarta.validation.Valid;
import com.example.taskgoblin.dto.UserProfileDTO;
import com.example.taskgoblin.dto.UserSettingsDTO;
import com.example.taskgoblin.service.UserService;
import com.example.taskgoblin.service.UserSettingsService;
import org.springframework.http.ResponseEntity;
import com.example.taskgoblin.dto.ChangePasswordDTO;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
    public ResponseEntity<UserProfileDTO> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateProfile(
            @Valid @RequestBody UserProfileDTO userProfileDTO,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        return ResponseEntity.ok(
                userService.updateProfile(userId, userProfileDTO)
        );
    }

    @PutMapping("/password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordDTO changePasswordDTO,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        userService.changePassword(userId, changePasswordDTO);

        return ResponseEntity.ok("Password changed successfully");
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteUser(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService
                .getUserByEmail(userDetails.getUsername())
                .getId();

        userService.deleteUser(userId);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/settings")
    public ResponseEntity<UserSettingsDTO> getUserSettings(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(userSettingsService.getUserSettings(userId));
    }

    @PatchMapping("/settings")
    public ResponseEntity<UserSettingsDTO> updateUserSettings(
            @RequestBody UserSettingsDTO userSettingsDTO,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = userService.getUserByEmail(userDetails.getUsername()).getId();

        return ResponseEntity.ok(
                userSettingsService.updateUserSettings(userId, userSettingsDTO)
        );
    }

}