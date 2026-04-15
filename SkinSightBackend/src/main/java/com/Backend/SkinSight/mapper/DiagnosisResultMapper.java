package com.Backend.SkinSight.mapper;

import com.Backend.SkinSight.dto.response.DiagnosisResultResponseDto;
import com.Backend.SkinSight.entity.DiagnosisResult;
import org.springframework.stereotype.Component;

@Component
public class DiagnosisResultMapper {

    public DiagnosisResultResponseDto toDto(DiagnosisResult result){
        if (result==null){
            return null;
        }
        return DiagnosisResultResponseDto.builder()
                .id(result.getId())
                .predictedClass(result.getPredictedClass())
                .confidenceScores(result.getConfidenceScores())
                .heatmapUrl(result.getHeatMapUrl())
                .severityScore(result.getSeverityScore())
                .severityLevel(result.getSeverityLevel().name())
                .createdAt(result.getCreatedAt())
                .build();
    }
}
