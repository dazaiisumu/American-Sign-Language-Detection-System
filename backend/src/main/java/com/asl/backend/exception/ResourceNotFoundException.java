package com.asl.backend.exception;

public class ResourceNotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    // Default constructor
    public ResourceNotFoundException() {
        super("Resource not found");
    }

    // Constructor with custom message
    public ResourceNotFoundException(String message) {
        super(message);
    }

    // Constructor with custom message and cause
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    // Constructor with cause
    public ResourceNotFoundException(Throwable cause) {
        super(cause);
    }
}
