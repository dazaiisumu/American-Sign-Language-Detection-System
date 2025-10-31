package com.asl.backend.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PlatformStatsDto {
    private double accuracyRate;
    private long activeUsers;
    private long signsDetected;
    private double uptime;
}
