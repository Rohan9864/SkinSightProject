package com.Backend.SkinSight.service.cases;

import com.Backend.SkinSight.dto.request.CreateCaseRequestDto;
import com.Backend.SkinSight.dto.response.CaseResponseDto;
import com.Backend.SkinSight.entity.Case;
import com.Backend.SkinSight.entity.User;
import com.Backend.SkinSight.enums.CaseStatus;
import com.Backend.SkinSight.enums.Role;
import com.Backend.SkinSight.exception.BadRequestException;
import com.Backend.SkinSight.exception.ResourceNotFoundException;
import com.Backend.SkinSight.mapper.CaseMapper;
import com.Backend.SkinSight.repository.CaseRepository;
import com.Backend.SkinSight.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CaseServiceImpl implements CaseService{
    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CaseMapper caseMapper;
    @Override
    public CaseResponseDto createCase(Long patientId, CreateCaseRequestDto dto) {
        User patient = userRepository.findById(patientId).orElseThrow(()->
                new ResourceNotFoundException("Patient not found"));

        Case newCase = Case.builder()
                .patient(patient)
                .imageUrl(dto.getImageUrl())
                .bodyArea(dto.getBodyArea())
                .description(dto.getDescription())
                .duration(dto.getDuration())
                .status(CaseStatus.PENDING)
                .build();

        Case savedCase = caseRepository.save(newCase);

        return caseMapper.toDto(savedCase);
    }

    @Override
    public CaseResponseDto getCaseById(Long caseId) {
        Case skinCase = caseRepository.findById(caseId).orElseThrow(()->
                new ResourceNotFoundException("Case not found with id: " + caseId));
        return caseMapper.toDto(skinCase);
    }

    @Override
    public List<CaseResponseDto> getMyCases(Long patientId) {
        List<Case> cases = caseRepository.findByPatientIdOrderBySubmittedAtDesc(patientId);
        return cases.stream()
                .map(caseMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CaseResponseDto> getPendingCases() {
        List<Case> cases = caseRepository.findByStatusOrderBySubmittedAtAsc(
                CaseStatus.UNDER_REVIEW);
        return cases.stream()
                .map(caseMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CaseResponseDto> getAllCases() {
        List<Case> cases = caseRepository.findAll();
        return cases.stream()
                .map(caseMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void updateCaseStatus(Long caseId, String status) {

        Case skinCase = caseRepository.findById(caseId).orElseThrow(() ->
                new ResourceNotFoundException("Case not found with id: " + caseId));

        skinCase.setStatus(CaseStatus.valueOf(status));
        caseRepository.save(skinCase);

    }

    @Override
    public CaseResponseDto assignCaseToDoctor(Long caseId, Long doctorId) {
        Case skinCase = caseRepository.findById(caseId).orElseThrow(()->
                new ResourceNotFoundException("Case not found with id: " + caseId));

        if (skinCase.getStatus()!=CaseStatus.PENDING){
            throw new BadRequestException( "Only PENDING cases can be assigned. " +
                    "Current status: " + skinCase.getStatus());
        }

        User doctor = userRepository.findById(doctorId).orElseThrow(()->
                new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        if (doctor.getRole()!= Role.DOCTOR){
            throw new BadRequestException(
                    "User with id " + doctorId +
                            " is not a doctor");
        }

        if (!doctor.isActive()){
            throw new BadRequestException(
                    "Cannot assign case to an inactive doctor");
        }

        skinCase.setAssignedDoctor(doctor);
        skinCase.setStatus(CaseStatus.UNDER_REVIEW);
        caseRepository.save(skinCase);
        return caseMapper.toDto(skinCase);
    }

    @Override
    public List<CaseResponseDto> getMyAssignedCases(Long doctorId) {
        List<Case> cases = caseRepository.findByAssignedDoctorIdAndStatus(
                doctorId,CaseStatus.UNDER_REVIEW);

        return cases.stream()
                .map(caseMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CaseResponseDto> getUnassignedCases() {
        List<Case> cases = caseRepository.findByStatusAndAssignedDoctorIsNull(CaseStatus.PENDING);

        return cases.stream()
                .map(caseMapper::toDto)
                .collect(Collectors.toList());
    }
}
