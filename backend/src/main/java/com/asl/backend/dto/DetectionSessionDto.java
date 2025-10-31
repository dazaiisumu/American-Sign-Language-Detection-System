package com.asl.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class DetectionSessionDto {
    private Long id;
    private LocalDateTime startTime;      // maps to createdAt
    private LocalDateTime endedAt;
    private long duration;               // in seconds
    private double averageConfidence;
    private int totalPredictions;
    private int uniqueSigns;
    private String status;               // "active" or "stopped"
    private String sessionType;          // e.g., practice/assessment/live
    private List<String> letters;        // detected letters in session

    public DetectionSessionDto(Long id, LocalDateTime startTime, LocalDateTime endedAt,
                               double averageConfidence, int totalPredictions, int uniqueSigns,
                               String status, String sessionType, List<String> letters) {
        this.id = id;
        this.startTime = startTime;
        this.endedAt = endedAt;
        this.averageConfidence = averageConfidence;
        this.totalPredictions = totalPredictions;
        this.uniqueSigns = uniqueSigns;
        this.status = status;
        this.sessionType = sessionType;
        this.letters = letters;
        this.duration = endedAt != null ? java.time.Duration.between(startTime, endedAt).getSeconds() : 0;
    }

    // Getters
    public Long getId() { return id; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndedAt() { return endedAt; }
    public long getDuration() { return duration; }
    public double getAverageConfidence() { return averageConfidence; }
    public int getTotalPredictions() { return totalPredictions; }
    public int getUniqueSigns() { return uniqueSigns; }
    public String getStatus() { return status; }
    public String getSessionType() { return sessionType; }
    public List<String> getLetters() { return letters; }
}
