package com.Backend.SkinSight.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCaseRequestDto {

//    @NotBlank(message = "Image URL is required")
//    private String imageUrl;

    private String bodyArea;

    @Size(max = 500,message = "Description too long")
    private String description;

    private String duration;
}
