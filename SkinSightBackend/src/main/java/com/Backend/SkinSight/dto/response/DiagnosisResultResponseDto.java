package com.Backend.SkinSight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DiagnosisResultResponseDto {
    private Long id;

    private String predictedClass;

    private String confidenceScores;

    private String heatmapUrl;

    private Double severityScore;

    private String severityLevel;

    private LocalDateTime createdAt;
}
