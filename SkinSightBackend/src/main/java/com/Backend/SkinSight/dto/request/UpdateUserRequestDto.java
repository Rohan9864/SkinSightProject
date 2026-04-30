package com.Backend.SkinSight.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequestDto {

    @Size(min = 2,message = "Name must be at least two characters ")
    private String name;

    private String profileImageUrl;
}
