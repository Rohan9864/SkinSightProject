package com.Backend.SkinSight.service.user;

import com.Backend.SkinSight.dto.request.UpdateUserRequestDto;
import com.Backend.SkinSight.dto.response.UserResponseDto;

import java.util.List;

public interface UserService {
    List<UserResponseDto> getAllDoctors();

    List<UserResponseDto> getAllPatients();

    UserResponseDto getUserById(Long userId);

    void toggleAccountStatus(Long adminId, Long userId);

    UserResponseDto getMyProfile(Long userId);

    UserResponseDto updateMyProfile(Long userId, UpdateUserRequestDto dto);
}
