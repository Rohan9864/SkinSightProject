package com.Backend.SkinSight.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PasswordResetRequestDto {

    @NotBlank(message = "Email is required")
    @Email(message = " please provide a valid email address")
    private String email;
}
