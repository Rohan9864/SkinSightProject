package com.Backend.SkinSight.service.report;

import com.Backend.SkinSight.dto.response.ReportResponseDto;
import com.Backend.SkinSight.entity.Case;
import com.Backend.SkinSight.entity.Report;
import com.Backend.SkinSight.entity.User;
import com.Backend.SkinSight.enums.CaseStatus;
import com.Backend.SkinSight.exception.BadRequestException;
import com.Backend.SkinSight.exception.ConflictException;
import com.Backend.SkinSight.exception.ResourceNotFoundException;
import com.Backend.SkinSight.mapper.ReportMapper;
import com.Backend.SkinSight.repository.CaseRepository;
import com.Backend.SkinSight.repository.ReportRepository;
import com.Backend.SkinSight.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReportServiceImpl implements ReportService{
    @Autowired
    private ReportRepository reportRepository;
    @Autowired
    private ReportMapper reportMapper;
    @Autowired
    private CaseRepository caseRepository;
    @Autowired
    private UserRepository userRepository;
    @Override
    public ReportResponseDto generateReport(Long caseId, Long doctorId) {
        if (reportRepository.existsBySkinCaseId(caseId)){
            throw new ConflictException( "Report already exists for case: " + caseId);
        }

        Case skinCase = caseRepository.findById(caseId).orElseThrow(()->
                new ResourceNotFoundException( "Case not found: " + caseId));

        if (skinCase.getStatus()!= CaseStatus.RELEASED){
            throw new BadRequestException(
                    "Report can only be generated for" +
                    "RELEASED cases. Current Status :"+
                    skinCase.getStatus());
        }

        User doctor = userRepository.findById(doctorId).orElseThrow(()->
                new ResourceNotFoundException( "Doctor not found: " + doctorId));

        String reportUrl = buildPdfAndSave(skinCase);

        Report report=Report.builder()
                .skinCase(skinCase)
                .generatedBy(doctor)
                .reportUrl(reportUrl)
                .build();

        Report savedReport = reportRepository.save(report);
        return reportMapper.toDto(savedReport);

    }

    @Override
    public ReportResponseDto getReportByCase(Long caseId) {
        Report report = reportRepository.findBySkinCaseId(caseId).orElseThrow(()->
                new ResourceNotFoundException("Report not found for case: " + caseId));

        return reportMapper.toDto(report);
    }

    @Override
    public ReportResponseDto getReportById(Long reportId) {

        Report report = reportRepository.findById(reportId).orElseThrow(()->
                new ResourceNotFoundException("Report not found: " + reportId));

        return reportMapper.toDto(report);

    }

    public String buildPdfAndSave(Case skinCase){
        String fileName="reports/report_case_"
                + skinCase.getId()
                +"_"
                +System.currentTimeMillis()
                +".pdf";

        return fileName;
    }
}
