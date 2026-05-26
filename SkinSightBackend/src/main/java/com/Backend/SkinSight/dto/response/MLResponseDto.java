package com.Backend.SkinSight.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MLResponseDto {
    
    @JsonProperty("case_id")
    private Long caseId;

    @JsonProperty("predicted_class")
    private String predictedClass;

    @JsonProperty("confidence_scores")
    private String confidenceScores;

    @JsonProperty("heatmap_url")
    private String heatmapUrl;

    @JsonProperty("severity_score")
    private Double severityScore;

    @JsonProperty("severity_level")
    private String severityLevel;

    @JsonProperty("success")
    private boolean success;

    @JsonProperty("error_message")
    private String errorMessage;


}
