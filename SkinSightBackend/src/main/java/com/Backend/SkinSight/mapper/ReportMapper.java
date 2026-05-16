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

        return ReportResponseDto.builder()
                .id(report.getId())
                .caseId(report.getSkinCase().getId())
                .patientName(report.getSkinCase().getPatient().getName())
                .generatedByName(report.getGeneratedBy().getName())
                .filePath(report.getFilePath())
                .reportUrl(report.getReportUrl())
                .generatedAt(report.getGeneratedAt())
                .build();
    }

}
