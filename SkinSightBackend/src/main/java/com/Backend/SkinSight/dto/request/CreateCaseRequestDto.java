package com.Backend.SkinSight.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCaseRequestDto {

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    private String bodyArea;

    private String description;

    private String duration;
}
