package com.asl.backend.controller;

import com.asl.backend.dto.*;
import com.asl.backend.entity.User;
import com.asl.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/users") // Base path for user operations
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Signup
    @PostMapping("/signup")
    public ResponseEntity<Response> signup(@RequestBody SignupRequestDto request) {
        if (request.getEmail() == null || request.getEmail().isEmpty() ||
            request.getPassword() == null || request.getPassword().isEmpty() ||
            request.getName() == null || request.getName().isEmpty() ||
            request.getConfirmPassword() == null || request.getConfirmPassword().isEmpty()) {
            return ResponseEntity.badRequest().body(new Response(false, "All fields are required", null));
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(new Response(false, "Passwords do not match", null));
        }

        User savedUser = userService.signup(new User(null, request.getName(), request.getEmail(), request.getPassword()));

        if (savedUser == null) {
            return ResponseEntity.badRequest().body(new Response(false, "Email already in use", null));
        }

        UserDto userDto = new UserDto(savedUser.getId(), savedUser.getEmail(), savedUser.getName());
        return ResponseEntity.ok(new Response(true, "Signup successful. Please login.", userDto));
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<Response> login(@RequestBody LoginRequestDto request, HttpSession session) {
        if (request.getEmail() == null || request.getEmail().isEmpty() ||
            request.getPassword() == null || request.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body(new Response(false, "Email and password are required", null));
        }

        User loggedUser = userService.login(request.getEmail(), request.getPassword());
        if (loggedUser == null) {
            return ResponseEntity.status(401).body(new Response(false, "Email or password is incorrect", null));
        }

        session.setAttribute("user", loggedUser);
        UserDto userDto = new UserDto(loggedUser.getId(), loggedUser.getEmail(), loggedUser.getName());
        return ResponseEntity.ok(new Response(true, "Login successful", userDto));
    }

    // Logout
    @PostMapping("/logout")
    public ResponseEntity<Response> logout(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null) {
            userService.logout(user.getEmail());
            session.invalidate();
        }
        return ResponseEntity.ok(new Response(true, "Logged out successfully", null));
    }

    // Current logged-in user
    @GetMapping("/me")
    public ResponseEntity<Response> getCurrentUser(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body(new Response(false, "Not logged in", null));
        }
        UserDto userDto = new UserDto(user.getId(), user.getEmail(), user.getName());
        return ResponseEntity.ok(new Response(true, "Current user fetched", userDto));
    }

    // ✅ Removed /users/active to avoid conflict
}
