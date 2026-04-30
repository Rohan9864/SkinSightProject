package com.Backend.SkinSight.service.auth;

import com.Backend.SkinSight.dto.request.*;
import com.Backend.SkinSight.dto.response.AuthResponseDto;
import com.Backend.SkinSight.dto.response.UserResponseDto;

public interface AuthService {
    void register(RegisterRequestDto dto ) ;

    AuthResponseDto login(LoginRequestDto dto);

    void verifyEmail(String token);

    void forgotPassword(PasswordResetRequestDto dto);

    void resetPassword(NewPasswordRequestDto dto);

    UserResponseDto  createDoctor(Long adminId, CreateDoctorRequestDto dto);



}
