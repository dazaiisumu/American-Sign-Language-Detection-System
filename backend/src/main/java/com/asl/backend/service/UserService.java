package com.asl.backend.service;

import com.asl.backend.entity.User;
import com.asl.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // Store active users (in-memory for now)
    private final Set<String> activeUsers = Collections.synchronizedSet(new HashSet<>());

    // Signup user and encode password
    public User signup(User user) {
        // Check if email already exists
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            return null; // Controller will handle "Email already in use"
        }

        // Encode password and save
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // Login user using email & password
    public User login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return null; // Email not found

        User user = userOpt.get();

        if (!passwordEncoder.matches(password, user.getPassword())) return null; // Invalid password

        // Add to active users
        activeUsers.add(email);

        return user; // Successful login
    }

    // Logout user
    public void logout(String email) {
        activeUsers.remove(email);
    }

    // ✅ Total registered users
    public int getTotalUsers() {
        return (int) userRepository.count();
    }

    // ✅ Active logged-in users
    public int getActiveUserCount() {
        return activeUsers.size();
    }

    // Optional: Fetch user by email
    public User getByEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        return userOpt.orElse(null);
    }
}
