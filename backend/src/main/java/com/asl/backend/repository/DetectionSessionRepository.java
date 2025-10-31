package com.asl.backend.repository;

import com.asl.backend.entity.DetectionSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetectionSessionRepository extends JpaRepository<DetectionSession, Long> {

    // Fetch all sessions for a specific user ordered by creation time descending
    List<DetectionSession> findByUser_IdOrderByCreatedAtDesc(Long userId);

    // Total signs detected = count of all results linked to sessions
    @Query("SELECT COUNT(r) FROM DetectionResult r")
    Long getTotalSignsDetected();

    // Average accuracy = average confidence across all detection results
    @Query("SELECT AVG(r.confidence) FROM DetectionResult r")
    Double getAverageAccuracy();
}
