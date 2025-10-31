package com.asl.backend.repository;

import com.asl.backend.entity.DetectionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetectionResultRepository extends JpaRepository<DetectionResult, Long> {
}
