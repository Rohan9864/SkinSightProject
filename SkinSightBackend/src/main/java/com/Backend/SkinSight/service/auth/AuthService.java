package com.Backend.SkinSight.service.auth;

import com.Backend.SkinSight.dto.request.*;
import com.Backend.SkinSight.dto.response.*;

public interface AuthService {
    void register(RegisterRequestDto dto ) ;

    AuthResponseDto login(LoginRequestDto dto);

    void verifyEmail(String token);

    void forgotPassword(PasswordResetRequestDto dto);

    void resetPassword(NewPasswordRequestDto dto);

    UserResponseDto createDoctor(Long adminId, CreateDoctorRequestDto dto);

    void changePassword(Long userId, ChangePasswordRequestDto dto);
}
