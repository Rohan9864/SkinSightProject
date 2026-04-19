package com.Backend.SkinSight.service.profile;

import com.Backend.SkinSight.dto.request.UpdateDoctorProfileRequestDto;
import com.Backend.SkinSight.dto.request.UpdatePatientProfileRequestDto;
import com.Backend.SkinSight.dto.response.DoctorProfileResponseDto;
import com.Backend.SkinSight.dto.response.PatientProfileResponseDto;
import com.Backend.SkinSight.entity.DoctorProfile;
import com.Backend.SkinSight.entity.PatientProfile;
import com.Backend.SkinSight.mapper.DoctorProfileMapper;
import com.Backend.SkinSight.mapper.PatientProfileMapper;
import com.Backend.SkinSight.repository.DoctorProfileRepository;
import com.Backend.SkinSight.repository.PatientProfileRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProfileServiceImpl implements ProfileService{
    @Autowired
    private DoctorProfileRepository doctorProfileRepository;
    @Autowired
    private PatientProfileRepository patientProfileRepository;
    @Autowired
    private DoctorProfileMapper doctorProfileMapper;
    @Autowired
    private PatientProfileMapper patientProfileMapper;
    @Override
    public PatientProfileResponseDto getPatientProfile(Long userId) {
        PatientProfile profile = patientProfileRepository.findByUserId(userId).orElseThrow(()->
                new RuntimeException("Patient profile not found for user: " + userId));
        return patientProfileMapper.toDto(profile);
    }

    @Override
    public PatientProfileResponseDto updatePatientProfile(
            Long userId, UpdatePatientProfileRequestDto dto) {
        PatientProfile profile = patientProfileRepository.findByUserId(userId).orElseThrow(()->
                new RuntimeException("Patient profile not found for user: " + userId));
        if (dto.getAge()!=null){
            profile.setAge(dto.getAge());
        }

        if (dto.getGender()!=null){
            profile.setGender(dto.getGender());
        }
        if (dto.getPhone()!=null && !dto.getPhone().isBlank()){
            profile.setPhone(dto.getPhone());
        }

        if (dto.getAddress() != null
                && !dto.getAddress().isBlank()) {
            profile.setAddress(dto.getAddress());
        }
        if (dto.getMedicalHistory() != null
                && !dto.getMedicalHistory().isBlank()) {
            profile.setMedicalHistory(dto.getMedicalHistory());
        }

        patientProfileRepository.save(profile);

        return patientProfileMapper.toDto(profile);
    }

    @Override
    public DoctorProfileResponseDto getDoctorProfile(Long userId) {
        DoctorProfile profile = doctorProfileRepository.findByUserId(userId).orElseThrow(()->
                new RuntimeException("Doctor profile not found for user: "+ userId));
        return doctorProfileMapper.toDto(profile);
    }

    @Override
    public DoctorProfileResponseDto updateDoctorProfile(
            Long userId, UpdateDoctorProfileRequestDto dto) {
        DoctorProfile profile = doctorProfileRepository.findByUserId(userId).orElseThrow(()->
                new RuntimeException("Doctor profile not found for user: "+ userId));
        if (dto.getSpecialization() != null
                && !dto.getSpecialization().isBlank()) {
            profile.setSpecialization(dto.getSpecialization());
        }

        if (dto.getPhone() != null
                && !dto.getPhone().isBlank()) {
            profile.setPhone(dto.getPhone());
        }

        if (dto.getHospitalAffiliation() != null
                && !dto.getHospitalAffiliation().isBlank()) {
            profile.setHospitalAffiliation(
                    dto.getHospitalAffiliation());
        }

        if (dto.getYearsOfExperience() != null) {
            profile.setYearsOfExperience(
                    dto.getYearsOfExperience());
        }
        doctorProfileRepository.save(profile);
        return doctorProfileMapper.toDto(profile);
    }

    @Override
    public List<DoctorProfileResponseDto> getAllDoctorProfiles() {
        List<DoctorProfile> profiles = doctorProfileRepository.findAll();
        return profiles.stream()
                .map(doctorProfileMapper::toDto)
                .collect(Collectors.toList());
    }
}
