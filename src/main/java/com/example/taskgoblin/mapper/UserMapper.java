package com.example.taskgoblin.mapper;

import com.example.taskgoblin.dto.RegisterDTO;
import com.example.taskgoblin.dto.UserProfileDTO;
import com.example.taskgoblin.dto.UserSettingsDTO;
import com.example.taskgoblin.model.User;
import com.example.taskgoblin.model.UserSettings;


public class UserMapper {

    public static UserProfileDTO mapToUserProfileDto(User user) {
        return new UserProfileDTO(
                user.getName(),
                user.getEmail()
        );
    }

    public static UserSettingsDTO mapToUserSettingsDto(UserSettings userSettings) {
        return new UserSettingsDTO(
                userSettings.getDefaultReminderMinutes(),
                userSettings.getNotificationsEnabled(),
                userSettings.getTheme(),
                userSettings.getLanguage()
        );
    }

    public static User mapToUserEntity(RegisterDTO dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        return user;
    }
}
