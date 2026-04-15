package com.Backend.SkinSight.controller;

import com.Backend.SkinSight.dto.request.UpdateDoctorProfileRequestDto;
import com.Backend.SkinSight.dto.request.UpdatePatientProfileRequestDto;
import com.Backend.SkinSight.dto.response.DoctorProfileResponseDto;
import com.Backend.SkinSight.dto.response.PatientProfileResponseDto;
import com.Backend.SkinSight.service.profile.ProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/patient/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientProfileResponseDto> getMyPatientProfile(
            @RequestAttribute("userId") Long userId){
        return ResponseEntity.ok(profileService.getPatientProfile(userId));
    }

    @PutMapping("/patient/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientProfileResponseDto> updateMyPatientProfile(
            @RequestAttribute("userId") Long userId,
            @Valid  @RequestBody UpdatePatientProfileRequestDto dto){
        return ResponseEntity.ok(profileService.updatePatientProfile(userId,dto));
    }

    @GetMapping("/doctor/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorProfileResponseDto> getMyDoctorProfile(
            @RequestAttribute("userId") Long userId){
        return ResponseEntity.ok(profileService.getDoctorProfile(userId));
    }

    @PutMapping("/doctor/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorProfileResponseDto> updateMyDoctorProfile(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody UpdateDoctorProfileRequestDto dto){
        return ResponseEntity.ok(profileService.updateDoctorProfile(userId,dto));
    }


    @GetMapping("/doctors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DoctorProfileResponseDto>> getAllDoctorProfiles(){
        return ResponseEntity.ok(profileService.getAllDoctorProfiles());

    }

    @GetMapping("/patient/{userId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<PatientProfileResponseDto> getPatientProfileById(
            @PathVariable Long userId){
        return ResponseEntity.ok(profileService.getPatientProfile(userId));
    }

    @GetMapping("/doctor/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorProfileResponseDto> getDoctorProfileById(
            @PathVariable Long userId){
        return ResponseEntity.ok(profileService.getDoctorProfile(userId));
    }

}
