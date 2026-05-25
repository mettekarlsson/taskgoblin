package com.example.taskgoblin.mapper;

import com.example.taskgoblin.dto.UserSettingsDTO;
import com.example.taskgoblin.model.UserSettings;

public class UserSettingsMapper {

    public static UserSettingsDTO mapToUserSettingsDto(UserSettings userSettings) {
        return new UserSettingsDTO(
                userSettings.getDefaultReminderMinutes(),
                userSettings.getNotificationsEnabled(),
                userSettings.getTheme(),
                userSettings.getLanguage()
        );
    }
}
