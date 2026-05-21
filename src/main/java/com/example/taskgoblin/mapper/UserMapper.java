package com.example.taskgoblin.mapper;

import com.example.taskgoblin.dto.UserProfileDTO;
import com.example.taskgoblin.model.User;

public class UserMapper {

    public static UserProfileDTO mapToUserProfileDto(User user) {
        return new UserProfileDTO(
                user.getName(),
                user.getEmail()
        );
    }
}
