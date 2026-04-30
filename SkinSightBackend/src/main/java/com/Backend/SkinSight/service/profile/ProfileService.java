package com.Backend.SkinSight.service.profile;

import com.Backend.SkinSight.dto.request.UpdateDoctorProfileRequestDto;
import com.Backend.SkinSight.dto.request.UpdatePatientProfileRequestDto;
import com.Backend.SkinSight.dto.response.DoctorProfileResponseDto;
import com.Backend.SkinSight.dto.response.PatientProfileResponseDto;

import java.util.List;

public interface ProfileService {

    PatientProfileResponseDto getPatientProfile(Long userId);

    PatientProfileResponseDto updatePatientProfile(
            Long userId, UpdatePatientProfileRequestDto dto);

    DoctorProfileResponseDto getDoctorProfile(Long userId);

    DoctorProfileResponseDto updateDoctorProfile(
            Long userId, UpdateDoctorProfileRequestDto dto);

    List<DoctorProfileResponseDto> getAllDoctorProfiles();
}
