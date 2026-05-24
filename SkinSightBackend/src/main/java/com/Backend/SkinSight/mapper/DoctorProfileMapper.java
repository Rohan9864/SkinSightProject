package com.Backend.SkinSight.mapper;

import com.Backend.SkinSight.dto.response.DoctorProfileResponseDto;
import com.Backend.SkinSight.entity.DoctorProfile;
import org.springframework.stereotype.Component;

import javax.print.Doc;

@Component
public class DoctorProfileMapper {
    public DoctorProfileResponseDto toDto(DoctorProfile profile){
        if (profile==null){
            return null;
        }

        return DoctorProfileResponseDto.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .name(profile.getUser().getName())
                .email(profile.getUser().getEmail())
                .specialization(profile.getSpecialization())
                .licenseNumber(profile.getLicenseNumber())
                .phone(profile.getPhone())
                .hospitalAffiliation(profile.getHospitalAffiliation())
                .yearsOfExperience(profile.getYearsOfExperience())
                .createdAt(profile.getUser().getCreatedAt())
                .build();
    }
}
