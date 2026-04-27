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


@Slf4j
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
    public DiagnosisResultResponseDto processAndSaveResult(Long caseId) {

        Case skinCase = caseRepository.findById(caseId).orElseThrow(()->
                new ResourceNotFoundException("Case not found with id: "
                        + caseId));
        if (skinCase.getStatus()!= CaseStatus.PENDING){
            throw new BadRequestException( "Case is not in PENDING status. "
                    + "Current status: "+skinCase.getStatus());
        }

        if (diagnosisResultRepository.existsBySkinCaseId(caseId)){
            throw new ConflictException( "AI result already exists "
                    + "for case: " + caseId);
        }
        log.info(
                "Sending case {} to ML service "
                        + "for analysis", caseId);

        MLResponseDto mlResult = mlServiceClient.analyzeImage(
                caseId,
                skinCase.getImageUrl());

        SeverityLevel severityLevel;

        try {
            severityLevel=SeverityLevel.valueOf(
                    mlResult.getSeverityLevel()
                            .toUpperCase());
        }catch (IllegalArgumentException e){
            log.error(
                    "Invalid severity level from ML" +
                            "Service: {}",
                    mlResult.getSeverityLevel());
            throw new BadRequestException( "Invalid severity level returned "
                    + "by AI service: "
                    + mlResult.getSeverityLevel());
        }

        DiagnosisResult diagnosisResult = DiagnosisResult.builder()
                .skinCase(skinCase)
                .predictedClass(mlResult.getPredictedClass())
                .confidenceScores(mlResult.getConfidenceScores())
                .heatMapUrl(mlResult.getHeatmapUrl())
                .severityScore(mlResult.getSeverityScore())
                .severityLevel(severityLevel)
                .build();

        DiagnosisResult savedResult = diagnosisResultRepository.save(diagnosisResult);

        log.info( "Saved diagnosis result for case {}. "
                        + "Predicted: {}, Severity: {}",
                caseId,
                mlResult.getPredictedClass(),
                severityLevel);

        skinCase.setStatus(CaseStatus.UNDER_REVIEW);
        caseRepository.save(skinCase);

        notifyAdmin(caseId);

        return diagnosisResultMapper.toDto(savedResult);


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
    public DiagnosisResultResponseDto getResultByCase(Long caseId) {

        DiagnosisResult result = diagnosisResultRepository.findBySkinCaseId(caseId).orElseThrow(()->
                new ResourceNotFoundException( "Diagnosis result not "
                        + "found for case: "
                        + caseId));
        return diagnosisResultMapper.toDto(result);
    }
}
