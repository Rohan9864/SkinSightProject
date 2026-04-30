package com.Backend.SkinSight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MLResponseDto {

    private Long caseId;

    private String predictedClass;

    private String confidenceScores;

    private String heatmapUrl;

    private Double severityScore;

    private String severityLevel;

    private boolean success;

    private String errorMessage;

}
