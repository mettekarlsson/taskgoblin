package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.RegisterDTO;
import com.example.taskgoblin.dto.UserProfileDTO;
import com.example.taskgoblin.exception.ResourceNotFoundException;
import com.example.taskgoblin.mapper.UserMapper;
import com.example.taskgoblin.model.Language;
import com.example.taskgoblin.model.User;
import com.example.taskgoblin.model.UserSettings;
import com.example.taskgoblin.repository.UserRepository;
import com.example.taskgoblin.repository.UserSettingsRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.taskgoblin.dto.ChangePasswordDTO;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, UserSettingsRepository userSettingsRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserProfileDTO getUserById(Long id) {
        User user = userRepository.findById(id)
         .orElseThrow(() -> new ResourceNotFoundException("User"));

        return UserMapper.mapToUserProfileDto(user);
    }

    //find user to save in login-token
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User"));
    }

    // register new user
    public UserProfileDTO register(RegisterDTO registerDto) {
        User user = UserMapper.mapToUserEntity(registerDto);
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        user.setRole("ROLE_USER");
        user.setCreatedAt(LocalDateTime.now());
        user.setStatus(true);
        User savedUser = userRepository.save(user);

        UserSettings userSettings = new UserSettings();
        userSettings.setUser(savedUser);
        userSettings.setDefaultReminderMinutes(15);
        userSettings.setNotificationsEnabled(true);
        userSettings.setTheme("light");
        userSettings.setLanguage(Language.en);

        userSettingsRepository.save(userSettings);
        return UserMapper.mapToUserProfileDto(savedUser);
    }

    public UserProfileDTO updateProfile(Long id, UserProfileDTO dto) {

        // Fetch the user from the database using the provided id.
        // If no user exists, throw a 404 NOT FOUND exception.
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User"));

        // Only update the name if it was included in the request.
        // This makes PATCH work when the user only wants to update one field.
        if (dto.getName() != null) {
            user.setName(dto.getName().trim());
        }

        // Only update the email if it was included in the request.
        if (dto.getEmail() != null) {

            // Check if another user already uses the same email address.
            // We exclude the current user by id so they can keep their own email.
            if (userRepository.existsByEmailAndIdNot(dto.getEmail(), id)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Email is already in use"
                );
            }

            // Update the email after the uniqueness check has passed.
            user.setEmail(dto.getEmail().trim().toLowerCase());
        }

        // Save the user after all possible changes have been applied.
        // This must be outside the if-blocks so both name-only and email-only updates work.
        User updatedUser = userRepository.save(user);

        // Convert the updated User entity into a DTO and return it.
        return UserMapper.mapToUserProfileDto(updatedUser);
    }

        public void changePassword(Long id, ChangePasswordDTO dto){

            // Fetch the user from the database.
            // Throw 404 NOT FOUND if the user does not exist.
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User"));

            // Verify that the current password entered by the user is correct.
            // If not, return a 400 BAD REQUEST error.
            if (!user.getPassword().equals(dto.getCurrentPassword())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Current password is incorrect"
                );
            }

            // Verify that the new password and confirmation password match.
            // This prevents accidental typos when changing passwords.
            if (!dto.getNewPassword().equals(dto.getConfirmNewPassword())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "New passwords do not match"
                );
            }

            // Update the password.
            // NOTE:
            // Right now passwords are stored as plain text because
            // authentication/security is not implemented yet.
            // Later this should use PasswordEncoder before saving.
            user.setPassword(dto.getNewPassword());

            // Save the updated password in the database.
            userRepository.save(user);
        }
    }