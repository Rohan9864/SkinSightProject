package com.Backend.SkinSight.mapper;

import com.Backend.SkinSight.dto.response.PatientProfileResponseDto;
import com.Backend.SkinSight.entity.PatientProfile;
import org.springframework.stereotype.Component;

@Component
public class PatientProfileMapper {

    public PatientProfileResponseDto toDto(PatientProfile profile){
        if (profile==null){
            return null;
        }
        return PatientProfileResponseDto.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .name(profile.getUser().getName())
                .email(profile.getUser().getEmail())
                .isEmailVerified(profile.getUser().isEmailVerified())
                .active(profile.getUser().isActive())
                .profileImageUrl(profile.getUser().getProfileImageUrl())
                .age(profile.getAge())
                .gender(profile.getGender())
                .phone(profile.getPhone())
                .address(profile.getAddress())
                .medicalHistory(profile.getMedicalHistory())
                .createdAt(profile.getUser().getCreatedAt())
                .build();
    }

}
