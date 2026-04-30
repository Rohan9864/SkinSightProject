package com.Backend.SkinSight.dto.request;

import com.Backend.SkinSight.enums.ReviewAction;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DoctorReviewRequestDto {

    @NotNull(message = "Review action is required")
    private ReviewAction action;

    private String overriddenClass;

    private String overriddenReason;

    private String clinicalNotes;

    private String recommendations;
}
