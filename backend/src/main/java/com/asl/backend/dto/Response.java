package com.asl.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data               // Generates getters, setters, toString, equals, hashCode
@NoArgsConstructor  // No-args constructor
@AllArgsConstructor // All-args constructor
public class Response {
    private boolean success;
    private String message;
    private Object data;
}
