package com.asl.backend.controller;

import com.asl.backend.dto.PlatformStatsDto;
import com.asl.backend.repository.DetectionSessionRepository;
import com.asl.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/platform")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class PlatformController {

    private final UserRepository userRepository;
    private final DetectionSessionRepository detectionSessionRepository;

    @GetMapping("/stats")
    public PlatformStatsDto getStats() {
        // Total active users
        long activeUsers = userRepository.count();

        // Total signs detected (sum of all sessions)
        Long signsDetected = detectionSessionRepository.getTotalSignsDetected();
        if (signsDetected == null) signsDetected = 0L;

        // Accuracy rate (average accuracy from sessions)
        Double averageAccuracy = detectionSessionRepository.getAverageAccuracy();
        if (averageAccuracy == null) averageAccuracy = 0.0;

        // Uptime - static for now
        double uptime = 99.9;

        return new PlatformStatsDto(averageAccuracy, activeUsers, signsDetected, uptime);
    }
}
