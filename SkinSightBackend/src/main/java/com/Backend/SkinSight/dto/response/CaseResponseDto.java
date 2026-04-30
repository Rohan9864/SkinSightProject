package com.Backend.SkinSight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseResponseDto {

    private Long id;

    private Long patientId;

    private String patientName;

    private String imageUrl;

    private String bodyArea;

    private String description;

    private String duration;

    private String status;

    private LocalDateTime submittedAt;

    private LocalDateTime updatedAt;

    private DiagnosisResultResponseDto diagnosisResult;

    private DoctorReviewResponseDto doctorReview;

    private Long assignedDoctorId;

    private String assignedDoctorName;


}
