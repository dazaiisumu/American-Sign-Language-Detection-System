package com.asl.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data               // generates getters, setters, toString, equals, hashCode
@NoArgsConstructor  // no-args constructor
@AllArgsConstructor // all-args constructor
public class DetectionResponse {
    private String letter;       // Predicted ASL letter
    private String filePath;     // Path of uploaded image
    private Long sessionId;      // Session ID
    private boolean success;     // Status of detection
    private String message;      // Additional message
    private double confidence;   // Confidence score of prediction
}
