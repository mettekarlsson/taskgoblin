package com.example.taskgoblin.service;

import com.example.taskgoblin.dto.UserProfileDTO;
import com.example.taskgoblin.mapper.UserMapper;
import com.example.taskgoblin.model.User;
import com.example.taskgoblin.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public UserProfileDTO getUserById(Long id) {
        User user = userRepository.findById(id)
         .orElseThrow(() -> new RuntimeException("User not found"));

        return UserMapper.mapToUserProfileDto(user);
    }
}
