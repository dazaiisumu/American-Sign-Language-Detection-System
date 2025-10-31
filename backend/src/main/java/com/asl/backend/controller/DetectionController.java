package com.asl.backend.controller;

import com.asl.backend.entity.DetectionResult;
import com.asl.backend.entity.DetectionSession;
import com.asl.backend.entity.User;
import com.asl.backend.service.DetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/detection")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class DetectionController {

    private final DetectionService detectionService;

    // Start a new detection session
    @PostMapping("/start")
    public ResponseEntity<?> startDetection(HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        DetectionSession started = detectionService.startDetection(currentUser);
        return ResponseEntity.ok(Map.of(
                "sessionId", started.getId(),
                "status", "active",
                "startTime", started.getCreatedAt()
        ));
    }

    // Stop the current detection session
    @PostMapping("/stop")
    public ResponseEntity<?> stopDetection(HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        Map<String, Object> stopResult = detectionService.stopDetection(currentUser.getId());
        Map<String, Object> summary = new HashMap<>();
        if ("stopped".equals(stopResult.get("status"))) {
            summary.put("duration", stopResult.get("duration"));
            summary.put("totalPredictions", stopResult.get("totalPredictions"));
            summary.put("averageConfidence", stopResult.get("averageConfidence"));
            summary.put("uniqueSigns", stopResult.get("uniqueSigns"));
        }

        return ResponseEntity.ok(Map.of(
                "sessionId", stopResult.get("sessionId"),
                "summary", summary
        ));
    }

    // Get latest detection result
    @GetMapping("/result")
    public ResponseEntity<?> getLatestResult(HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        Map<String, Object> result = detectionService.getLatestPrediction(currentUser.getId());
        return ResponseEntity.ok(result);
    }

    // Get paginated session history for current user
    @GetMapping("/sessions")
    public ResponseEntity<?> getSessionHistory(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            HttpSession session
    ) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        List<DetectionSession> allSessions = detectionService.getSessionsByUserId(currentUser.getId());
        int totalSessions = allSessions.size();
        int totalPages = (int) Math.ceil((double) totalSessions / limit);
        int fromIndex = Math.min((page - 1) * limit, totalSessions);
        int toIndex = Math.min(fromIndex + limit, totalSessions);

        List<DetectionSession> pagedSessions = allSessions.subList(fromIndex, toIndex);

        List<Map<String, Object>> sessions = pagedSessions.stream().map(s -> {
            List<DetectionResult> results = s.getResults() != null ? s.getResults() : Collections.emptyList();
            long duration = s.getEndedAt() != null
                    ? java.time.Duration.between(s.getCreatedAt(), s.getEndedAt()).toSeconds()
                    : 0;

            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("userName", s.getUser().getName()); // <-- added userName
            map.put("startTime", s.getCreatedAt());
            map.put("duration", duration);
            map.put("totalPredictions", results.size());
            map.put("averageConfidence", results.stream().mapToDouble(DetectionResult::getConfidence).average().orElse(0.0));
            map.put("letters", results.stream().map(DetectionResult::getLetter).collect(Collectors.toList()));

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "sessions", sessions,
                "totalPages", totalPages,
                "currentPage", page
        ));
    }
}
