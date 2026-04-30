package com.Backend.SkinSight.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignCaseRequestDto {

    @NotNull(message = "Doctor Id is required")
    private Long doctorId;
}
