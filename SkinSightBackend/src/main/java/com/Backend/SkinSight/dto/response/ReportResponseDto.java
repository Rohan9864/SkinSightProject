package com.Backend.SkinSight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponseDto {
    private Long id;

    private  Long caseId;

    private String patientName;

    private String predictedDisease;

    private String severityLevel;

    private String reportUrl;

    private String generatedByName;

    private String generatedAt;

}
