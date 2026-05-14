package com.Backend.SkinSight.mapper;

import com.Backend.SkinSight.dto.response.CaseResponseDto;
import com.Backend.SkinSight.entity.Case;
import com.Backend.SkinSight.enums.CaseStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CaseMapper {

    @Autowired
    private DiagnosisResultMapper diagnosisResultMapper;
    @Autowired
    private DoctorReviewMapper doctorReviewMapper;

    public CaseResponseDto toDto(Case skinCase){
        return toDto(skinCase,false);
    }

    public CaseResponseDto toDto(Case skinCase, boolean isStaff){
        if (skinCase==null){
            return null;
        }

        boolean showResult = isStaff || skinCase.getStatus()== CaseStatus.RELEASED;
        return CaseResponseDto.builder()
                .id(skinCase.getId())
                .patientId(skinCase.getPatient().getId())
                .patientName(skinCase.getPatient().getName())
                .imageUrl(skinCase.getImageUrl())
                .bodyArea(skinCase.getBodyArea())
                .description(skinCase.getDescription())
                .duration(skinCase.getDuration())
                .status(skinCase.getStatus().name())
                .submittedAt(skinCase.getSubmittedAt())
                .updatedAt((skinCase.getUpdatedAt()))
                .diagnosisResult(
                        showResult && skinCase.getDiagnosisResult() != null
                        ? diagnosisResultMapper.toDto(skinCase.getDiagnosisResult())
                                :null)
                .doctorReview(
                        showResult && skinCase.getDoctorReview() != null
                        ? doctorReviewMapper.toDto(skinCase.getDoctorReview())
                                :null)
                .assignedDoctorId(
                        skinCase.getAssignedDoctor() != null
                                ? skinCase.getAssignedDoctor().getId()
                                : null)
                .assignedDoctorName(
                        skinCase.getAssignedDoctor() != null
                                ? skinCase.getAssignedDoctor().getName()
                                : null)
                .build();
    }
}
