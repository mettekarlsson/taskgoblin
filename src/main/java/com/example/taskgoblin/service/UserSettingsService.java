package com.example.taskgoblin.service;


import com.example.taskgoblin.dto.UserSettingsDTO;
import com.example.taskgoblin.exception.ResourceNotFoundException;
import com.example.taskgoblin.mapper.UserMapper;
import com.example.taskgoblin.model.UserSettings;
import com.example.taskgoblin.repository.UserSettingsRepository;
import org.springframework.stereotype.Service;

@Service
public class UserSettingsService {

    private final UserSettingsRepository userSettingsRepository;

    public UserSettingsService(UserSettingsRepository userSettingsRepository) {
        this.userSettingsRepository = userSettingsRepository;
    }

    public UserSettingsDTO getUserSettings(Long id) {
        UserSettings userSettings = userSettingsRepository
                .findByUserId(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User settings"));

        return UserMapper.mapToUserSettingsDto(userSettings);
    }

    public UserSettingsDTO updateUserSettings(Long id, UserSettingsDTO userSettingsDTO) {
        UserSettings userSettings = userSettingsRepository
                .findByUserId(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User settings"));

        if (userSettingsDTO.getDefaultReminderMinutes() != null) {
            userSettings.setDefaultReminderMinutes(userSettingsDTO.getDefaultReminderMinutes());
        }

        if (userSettingsDTO.getNotificationsEnabled() != null) {
            userSettings.setNotificationsEnabled(userSettingsDTO.getNotificationsEnabled());
        }

        if (userSettingsDTO.getTheme() != null) {
            userSettings.setTheme(userSettingsDTO.getTheme());
        }

        if (userSettingsDTO.getLanguage() != null) {
            userSettings.setLanguage(userSettingsDTO.getLanguage());
        }

        UserSettings updatedUserSettings = userSettingsRepository.save(userSettings);

        return UserMapper.mapToUserSettingsDto(updatedUserSettings);
    }

}
