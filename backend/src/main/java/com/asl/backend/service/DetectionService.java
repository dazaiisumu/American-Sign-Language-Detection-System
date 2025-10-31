package com.asl.backend.service;

import com.asl.backend.entity.DetectionResult;
import com.asl.backend.entity.DetectionSession;
import com.asl.backend.entity.User;
import com.asl.backend.repository.DetectionResultRepository;
import com.asl.backend.repository.DetectionSessionRepository;
import com.asl.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RequiredArgsConstructor
@Service
public class DetectionService {

    private final DetectionSessionRepository sessionRepo;
    private final DetectionResultRepository resultRepo;
    private final UserRepository userRepo; // Inject UserRepository
    private final PythonIntegrationService pythonService;

    private final Map<Long, DetectionSession> activeSessions = new ConcurrentHashMap<>();
    private final Map<Long, String> latestPredictions = new ConcurrentHashMap<>();

    /** Start a detection session */
    public DetectionSession startDetection(User user) {
        DetectionSession session = new DetectionSession();
        session.setUser(user);
        session.setCreatedAt(LocalDateTime.now());
        session.setStatus("active");
        session.setResults(new ArrayList<>());
        session = sessionRepo.save(session);

        activeSessions.put(user.getId(), session);
        latestPredictions.put(user.getId(), "");

        try {
            String status = pythonService.startDetection();
            System.out.println("Python ASL detection status: " + status);
        } catch (Exception e) {
            System.err.println("Error starting Python detection: " + e.getMessage());
        }

        return session;
    }

    /** Stop a detection session */
    public Map<String, Object> stopDetection(Long userId) {
        DetectionSession session = activeSessions.remove(userId);
        Map<String, Object> response = new HashMap<>();

        if (session != null) {
            session.setEndedAt(LocalDateTime.now());
            session.setStatus("stopped");
            sessionRepo.save(session);
            latestPredictions.remove(userId);

            try {
                String status = pythonService.stopDetection();
                System.out.println("Python ASL detection stopped: " + status);
            } catch (Exception e) {
                System.err.println("Error stopping Python detection: " + e.getMessage());
            }

            List<DetectionResult> results = session.getResults() != null ? session.getResults() : new ArrayList<>();
            long duration = Duration.between(session.getCreatedAt(), session.getEndedAt()).toSeconds();
            int totalPredictions = results.size();
            double avgConfidence = results.stream()
                    .mapToDouble(DetectionResult::getConfidence)
                    .average()
                    .orElse(0.0);
            long uniqueSigns = results.stream()
                    .map(DetectionResult::getLetter)
                    .distinct()
                    .count();

            response.put("sessionId", session.getId());
            response.put("status", session.getStatus());
            response.put("duration", duration);
            response.put("totalPredictions", totalPredictions);
            response.put("averageConfidence", avgConfidence);
            response.put("uniqueSigns", uniqueSigns);
        } else {
            response.put("status", "no active session");
        }

        return response;
    }

    /** Save a detection result */
    public DetectionResult saveDetectionResult(DetectionSession session, String letter, double confidence) {
        if (session.getResults() == null) session.setResults(new ArrayList<>());

        DetectionResult result = new DetectionResult();
        result.setSession(session);
        result.setLetter(letter);
        result.setConfidence(confidence);
        result = resultRepo.save(result);

        session.getResults().add(result);
        sessionRepo.save(session);

        latestPredictions.put(session.getUser().getId(), letter);
        return result;
    }

    /** Get latest prediction for a user */
    public Map<String, Object> getLatestPrediction(Long userId) {
        PythonIntegrationService.PythonResult result;
        try {
            result = pythonService.getLatestResult();
        } catch (Exception e) {
            System.err.println("Error fetching latest Python result: " + e.getMessage());
            return Map.of("prediction", null, "confidence", 0.0);
        }

        if (result == null) {
            return Map.of("prediction", null, "confidence", 0.0);
        }

        String letter = result.letter();
        double confidence = result.confidence();

        if (activeSessions.containsKey(userId)) {
            saveDetectionResult(activeSessions.get(userId), letter, confidence);
        }

        return Map.of("prediction", letter, "confidence", confidence);
    }

    /** Fetch all sessions for a user */
    public List<DetectionSession> getSessionsByUserId(Long userId) {
        // Use correct repository method
        return sessionRepo.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    /** Fetch all sessions globally for dashboard */
    public List<DetectionSession> getAllSessions() {
        return sessionRepo.findAll();
    }

    /** ✅ Get total number of registered users */
    public int getTotalUsers() {
        return (int) userRepo.count();
    }

    /** Optionally, get active user count for dashboard */
    public int getActiveUserCount() {
        return activeSessions.size();
    }
}
