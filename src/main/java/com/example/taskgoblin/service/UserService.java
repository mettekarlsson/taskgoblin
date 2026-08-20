package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.RegisterDTO;
import com.example.taskgoblin.dto.UserProfileDTO;
import com.example.taskgoblin.exception.ResourceNotFoundException;
import com.example.taskgoblin.mapper.UserMapper;
import com.example.taskgoblin.model.Language;
import com.example.taskgoblin.model.User;
import com.example.taskgoblin.model.UserSettings;
import com.example.taskgoblin.repository.*;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.taskgoblin.dto.ChangePasswordDTO;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final PasswordEncoder passwordEncoder;
    private final TaskRepository taskRepository;
    private final NoteRepository noteRepository;
    private final CalendarRepository calendarRepository;
    private final TaskListRepository taskListRepository;
    private final CompletionHistoryRepository completionHistoryRepository;

    public UserService(UserRepository userRepository, UserSettingsRepository userSettingsRepository, PasswordEncoder passwordEncoder, TaskRepository taskRepository, NoteRepository noteRepository, CalendarRepository calendarRepository, TaskListRepository taskListRepository, CompletionHistoryRepository completionHistoryRepository) {
        this.userRepository = userRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.passwordEncoder = passwordEncoder;
        this.taskRepository = taskRepository;
        this.noteRepository = noteRepository;
        this.calendarRepository = calendarRepository;
        this.taskListRepository = taskListRepository;
        this.completionHistoryRepository = completionHistoryRepository;
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

            // Verify the current password against the stored BCrypt hash.
            if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {

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
            // Hash the new password before storing it in the database.
            user.setPassword(passwordEncoder.encode(dto.getNewPassword()));

            // Save the updated password in the database.
            userRepository.save(user);
        }

    @Transactional
    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User"));

        completionHistoryRepository.deleteByUserId(id);
        taskRepository.deleteByUserId(id);
        noteRepository.deleteByUserId(id);
        calendarRepository.deleteByUserId(id);
        taskListRepository.deleteByUserId(id);

        userRepository.delete(user);
    }
    }

