package com.example.taskgoblin.service;


import com.example.taskgoblin.dto.UserSettingsDTO;
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
        UserSettings userSettings = userSettingsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User settings not found"));

        return UserMapper.mapToUserSettingsDto(userSettings);
    }

}
