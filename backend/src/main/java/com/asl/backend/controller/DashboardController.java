package com.asl.backend.controller;

import com.asl.backend.entity.DetectionResult;
import com.asl.backend.entity.DetectionSession;
import com.asl.backend.service.DetectionService;
import com.asl.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class DashboardController {

    private final DetectionService detectionService;
    private final UserService userService;

    @GetMapping("/users/total")
    public ResponseEntity<?> getTotalUsers() {
        try {
            int totalUsers = userService.getTotalUsers();
            return ResponseEntity.ok(Map.of("totalUsers", totalUsers));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to fetch total users: " + e.getMessage()));
        }
    }

    @GetMapping("/users/active")
    public ResponseEntity<?> getActiveUsers() {
        try {
            int activeUsers = userService.getActiveUserCount(); // ✅ from UserService
            return ResponseEntity.ok(Map.of("activeUsers", activeUsers));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to fetch active users: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            List<DetectionSession> allSessions = detectionService.getAllSessions();

            long totalSessions = allSessions.size();
            long totalSignsDetected = allSessions.stream()
                    .flatMap(s -> s.getResults() != null ? s.getResults().stream() : Stream.empty())
                    .count();

            double accuracyRate = allSessions.stream()
                    .flatMap(s -> s.getResults() != null ? s.getResults().stream() : Stream.empty())
                    .mapToDouble(DetectionResult::getConfidence)
                    .average()
                    .orElse(0.0);

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalSessions", totalSessions);
            stats.put("totalSignsDetected", totalSignsDetected);
            stats.put("accuracyRate", accuracyRate);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to fetch stats: " + e.getMessage()));
        }
    }
}
