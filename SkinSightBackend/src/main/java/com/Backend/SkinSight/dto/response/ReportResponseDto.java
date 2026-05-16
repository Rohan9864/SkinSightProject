package com.Backend.SkinSight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponseDto {
    private Long id;

    private  Long caseId;

    private String patientName;

    private String generatedByName;

    private String filePath;

    private String reportUrl;

    private LocalDateTime generatedAt;

}
