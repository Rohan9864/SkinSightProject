package com.Backend.SkinSight.mapper;

import com.Backend.SkinSight.dto.response.UserResponseDto;
import com.Backend.SkinSight.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponseDto toDto(User user){
        if (user==null){
            return null;
        }

        return UserResponseDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isActive((user.isActive()))
                .isEmailVerified(user.isEmailVerified())
                .profileImageUrl((user.getProfileImageUrl()))
                .createdAt((user.getCreatedAt()))
                .build();
    }
}
