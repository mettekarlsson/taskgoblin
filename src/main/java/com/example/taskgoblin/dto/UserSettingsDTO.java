package com.example.taskgoblin.dto;

import com.example.taskgoblin.model.Language;
import com.example.taskgoblin.model.User;

public class UserSettingsDTO {

    private Integer defaultReminderMinutes;

    private Boolean notificationsEnabled;

    private String theme;

    private Language language;

    public UserSettingsDTO(Integer defaultReminderMinutes, Boolean notificationsEnabled, String theme, Language language) {
        this.defaultReminderMinutes = defaultReminderMinutes;
        this.notificationsEnabled = notificationsEnabled;
        this.theme = theme;
        this.language = language;


    }


    public Integer getDefaultReminderMinutes() {
        return defaultReminderMinutes;
    }

    public void setDefaultReminderMinutes(Integer defaultReminderMinutes) {
        this.defaultReminderMinutes = defaultReminderMinutes;
    }

    public Boolean getNotificationsEnabled() {
        return notificationsEnabled;
    }

    public void setNotificationsEnabled(Boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public Language getLanguage() {
        return language;
    }

    public void setLanguage(Language language) {
        this.language = language;
    }
}

