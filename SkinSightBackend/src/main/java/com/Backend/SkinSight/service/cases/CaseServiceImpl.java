package com.Backend.SkinSight.service.cases;

import com.Backend.SkinSight.dto.request.CreateCaseRequestDto;
import com.Backend.SkinSight.dto.response.CaseResponseDto;
import com.Backend.SkinSight.dto.response.FileUploadResponseDto;
import com.Backend.SkinSight.entity.Case;
import com.Backend.SkinSight.entity.User;
import com.Backend.SkinSight.enums.AuditAction;
import com.Backend.SkinSight.enums.CaseStatus;
import com.Backend.SkinSight.enums.Role;
import com.Backend.SkinSight.event.CaseCreatedEvent;
import com.Backend.SkinSight.exception.BadRequestException;
import com.Backend.SkinSight.exception.ResourceNotFoundException;
import com.Backend.SkinSight.exception.UnauthorizedException;
import com.Backend.SkinSight.mapper.CaseMapper;
import com.Backend.SkinSight.repository.CaseRepository;
import com.Backend.SkinSight.repository.UserRepository;
import com.Backend.SkinSight.service.audit.AuditLogService;
import com.Backend.SkinSight.service.diagnosis.DiagnosisResultService;
import com.Backend.SkinSight.service.file.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class CaseServiceImpl implements CaseService{
    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CaseMapper caseMapper;

    @Autowired
    private DiagnosisResultService diagnosisResultService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    public CaseResponseDto createCase(Long patientId, MultipartFile image, CreateCaseRequestDto dto) {
        User patient = userRepository.findById(patientId).orElseThrow(()->
                new ResourceNotFoundException("Patient not found : "+ patientId));

        FileUploadResponseDto uploadedFile = fileStorageService.storeCaseImage(image,patientId);

        log.info("Image saved: {}", uploadedFile.getFilePath());

        Case newCase;
        try{
            newCase = Case.builder()
                    .patient(patient)
                    .imageUrl(uploadedFile.getFilePath())
                    .bodyArea(dto != null
                            ? dto.getBodyArea() : null)
                    .description(dto != null
                            ? dto.getDescription() : null)
                    .duration(dto != null
                            ? dto.getDuration() : null)
                    .status(CaseStatus.PENDING)
                    .build();

            newCase = caseRepository.save(newCase);
            log.info("Case {} created. Image: {}",
                    newCase.getId(),
                    newCase.getImageUrl());
        } catch (Exception e){
            fileStorageService.deleteFile(uploadedFile.getFilePath());
            throw e;
        }

        final Long caseId = newCase.getId();
        final String imageUrl = newCase.getImageUrl();

        eventPublisher.publishEvent(new CaseCreatedEvent(
                this,
                newCase.getId(),
                newCase.getImageUrl()));
        log.info("CaseCreatedEvent published for case {}",
                newCase.getId());

        return caseMapper.toDto(newCase);
    }

    @Override
    public CaseResponseDto getCaseById(Long caseId,Long requesterId) {
        Case skinCase = caseRepository.findById(caseId).orElseThrow(()->
                new ResourceNotFoundException("Case not found with id: " + caseId));

        User requester = userRepository.findById(requesterId).orElseThrow(()->
                new ResourceNotFoundException("User not found : " + requesterId));
        if (requester.getRole()==Role.PATIENT &&
                !skinCase.getPatient().getId().equals(requesterId)){
            throw new UnauthorizedException("You can only access your own cases.");
        }

        boolean isStaff = requester.getRole() == Role.DOCTOR
                          || requester.getRole() == Role.ADMIN ;

        return caseMapper.toDto(skinCase,isStaff);
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
    public CaseResponseDto assignCaseToDoctor(Long adminId,Long caseId, Long doctorId) {
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

        auditLogService.log(
                adminId,
                AuditAction.CASE_ASSIGNED_TO_DOCTOR,
                "Case",
                caseId,
                "Case # " + caseId
                + " assigned to "+ doctor.getName()
                + "( ID : " + doctorId + ")");

        return caseMapper.toDto(skinCase);
    }

    @Override
    public List<CaseResponseDto> getMyAssignedCases(Long doctorId) {
        List<Case> cases = caseRepository.findByAssignedDoctorId(doctorId);

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
