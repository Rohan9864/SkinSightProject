package com.Backend.SkinSight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorReviewResponseDto {

    private Long id;

    private Long doctorId;

    private String doctorName;

    private String action;

    private String overriddenClass;

    private String overrideReason;

    private String clinicalNotes;

    private String recommendations;

    private LocalDateTime reviewedAt;

    private LocalDateTime releasedAt;

}
