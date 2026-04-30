package com.Backend.SkinSight.mapper;

import com.Backend.SkinSight.dto.response.ReportResponseDto;
import com.Backend.SkinSight.entity.DiagnosisResult;
import com.Backend.SkinSight.entity.DoctorReview;
import com.Backend.SkinSight.entity.Report;
import com.Backend.SkinSight.enums.ReviewAction;
import org.springframework.stereotype.Component;

@Component
public class ReportMapper {

    public ReportResponseDto toDto(Report report){

        if (report==null){
            return null;
        }

        DoctorReview doctorReview =report.getSkinCase().getDoctorReview();

        DiagnosisResult diagnosisResult=report.getSkinCase().getDiagnosisResult();

        String finalDisease = null;
        if (doctorReview !=null && diagnosisResult !=null){
            if (doctorReview.getAction()==ReviewAction.OVERRIDDEN){
                finalDisease=doctorReview.getOverriddenClass();
            }else {
                finalDisease=diagnosisResult.getPredictedClass();
            }
        }

        String severity = null;
        if (diagnosisResult !=null && diagnosisResult.getSeverityLevel() !=null){
            severity=diagnosisResult.getSeverityLevel().name();
        }

        return ReportResponseDto.builder()
                .id(report.getId())
                .caseId(report.getSkinCase().getId())
                .patientName(report.getSkinCase().getPatient().getName())
                .predictedDisease((finalDisease))
                .severityLevel(severity)
                .reportUrl(report.getReportUrl())
                .generatedByName(report.getGeneratedBy().getName())
                .generatedAt(report.getGeneratedAt())
                .build();
    }

}
