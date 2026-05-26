package com.Backend.SkinSight.service.diagnosis;

import com.Backend.SkinSight.client.MLServiceClient;
import com.Backend.SkinSight.dto.response.DiagnosisResultResponseDto;
import com.Backend.SkinSight.dto.response.MLResponseDto;
import com.Backend.SkinSight.entity.Case;
import com.Backend.SkinSight.entity.DiagnosisResult;
import com.Backend.SkinSight.enums.CaseStatus;
import com.Backend.SkinSight.enums.NotificationType;
import com.Backend.SkinSight.enums.Role;
import com.Backend.SkinSight.enums.SeverityLevel;
import com.Backend.SkinSight.exception.BadRequestException;
import com.Backend.SkinSight.exception.ConflictException;
import com.Backend.SkinSight.exception.ResourceNotFoundException;
import com.Backend.SkinSight.mapper.DiagnosisResultMapper;
import com.Backend.SkinSight.repository.CaseRepository;
import com.Backend.SkinSight.repository.DiagnosisResultRepository;
import com.Backend.SkinSight.repository.UserRepository;
import com.Backend.SkinSight.service.notification.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;


@Slf4j
@Service
public class DiagnosisResultServiceImpl implements DiagnosisResultService{

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private DiagnosisResultRepository diagnosisResultRepository;

    @Autowired
    private MLServiceClient mlServiceClient;

    @Autowired
    private DiagnosisResultMapper diagnosisResultMapper;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public DiagnosisResultResponseDto processAndSaveResult(
            Long caseId) {

        log.info("Processing ML for case {}", caseId);

        Case skinCase = caseRepository
                .findById(caseId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Case not found: " + caseId));

        log.info("Case found. Status: {} Image: {}",
                skinCase.getStatus(),
                skinCase.getImageUrl());

        if (skinCase.getStatus() != CaseStatus.PENDING
                && skinCase.getStatus() != CaseStatus.UNDER_REVIEW) {
            throw new BadRequestException(
                    "Case is not ready for ML analysis. Status: "
                            + skinCase.getStatus());
        }

        if (diagnosisResultRepository
                .existsBySkinCaseId(caseId)) {
            throw new ConflictException(
                    "Result already exists for case: " + caseId);
        }

        // Call Django
        MLResponseDto mlResult =
                mlServiceClient.analyzeImage(
                        caseId,
                        skinCase.getImageUrl());

        log.info("ML response: predicted={} severity={}",
                mlResult.getPredictedClass(),
                mlResult.getSeverityLevel());

        // Convert severity string to enum
        SeverityLevel severityLevel;
        try {
            severityLevel = SeverityLevel.valueOf(
                    mlResult.getSeverityLevel().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(
                    "Invalid severity from ML: "
                            + mlResult.getSeverityLevel());
        }

        // Save DiagnosisResult
        DiagnosisResult diagnosisResult =
                DiagnosisResult.builder()
                        .skinCase(skinCase)
                        .predictedClass(
                                mlResult.getPredictedClass())
                        .confidenceScores(
                                mlResult.getConfidenceScores())
                        .heatMapUrl(
                                mlResult.getHeatmapUrl())
                        .severityScore(
                                mlResult.getSeverityScore())
                        .severityLevel(severityLevel)
                        .build();

        DiagnosisResult saved =
                diagnosisResultRepository
                        .save(diagnosisResult);

        log.info("DiagnosisResult saved for case {}. ID: {}",
                caseId, saved.getId());

        // Update case status to UNDER_REVIEW
//        skinCase.setStatus(CaseStatus.UNDER_REVIEW);
        caseRepository.save(skinCase);

        log.info("Case {} status updated to UNDER_REVIEW",
                caseId);

        // Notify admins
        notifyAdmin(caseId);

        return diagnosisResultMapper.toDto(saved);
    }

    private void notifyAdmin(Long caseId) {
        userRepository.findByRole(Role.ADMIN)
                .forEach(admin ->
                        notificationService.sendNotification(
                                admin.getId(),
                                NotificationType.RESULT_READY,
                                "A new case (ID: " + caseId
                                        + ") has been analysed by AI "
                                        + "and is ready for assignment "
                                        + "to a doctor.",
                                caseId));
    }

    @Override
    @Transactional(readOnly = true)
    public DiagnosisResultResponseDto getResultByCase(Long caseId) {

        DiagnosisResult result = diagnosisResultRepository.findBySkinCaseId(caseId).orElseThrow(()->
                new ResourceNotFoundException( "Diagnosis result not "
                        + "found for case: "
                        + caseId));
        return diagnosisResultMapper.toDto(result);
    }
}
