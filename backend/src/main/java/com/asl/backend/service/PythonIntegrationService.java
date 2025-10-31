package com.asl.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.Map;

@Service
@Slf4j
public class PythonIntegrationService {

    private final RestTemplate restTemplate;

    @Value("${python.api.url:http://localhost:8000}")
    private String fastApiBaseUrl;

    public PythonIntegrationService() {
        // Set timeouts for safety
        var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000); // 3 seconds
        factory.setReadTimeout(3000);    // 3 seconds
        this.restTemplate = new RestTemplate(factory);
    }

    /** DTO for Python result */
    public record PythonResult(String letter, double confidence) {}

    /** Start the ASL detection loop */
    public String startDetection() {
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    fastApiBaseUrl + "/start-detection",
                    null,
                    Map.class
            );
            return response.getBody().getOrDefault("status", "error").toString();
        } catch (RestClientException e) {
            log.error("Error starting detection: {}", e.getMessage(), e);
            return "error";
        }
    }

    /** Stop the ASL detection loop */
    public String stopDetection() {
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    fastApiBaseUrl + "/stop-detection",
                    null,
                    Map.class
            );
            return response.getBody().getOrDefault("status", "error").toString();
        } catch (RestClientException e) {
            log.error("Error stopping detection: {}", e.getMessage(), e);
            return "error";
        }
    }

    /** Get the latest detection result in a type-safe way */
    public PythonResult getLatestResult() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    fastApiBaseUrl + "/get-results",
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body == null) {
                return new PythonResult("Uncertain", 0.0);
            }

            String letter = body.getOrDefault("letter", "Uncertain").toString();
            double confidence = Double.parseDouble(body.getOrDefault("confidence", 0.0).toString());

            return new PythonResult(letter, confidence);

        } catch (RestClientException | NumberFormatException e) {
            log.error("Error fetching latest result: {}", e.getMessage(), e);
            return new PythonResult("Uncertain", 0.0);
        }
    }
}
