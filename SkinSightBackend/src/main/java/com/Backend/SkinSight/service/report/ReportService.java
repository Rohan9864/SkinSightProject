package com.Backend.SkinSight.service.report;

import com.Backend.SkinSight.dto.response.ReportResponseDto;

public interface ReportService {
    ReportResponseDto generateReport(Long caseId,Long doctorId);

    ReportResponseDto getReportByCase(Long caseId);

    ReportResponseDto getReportById(Long reportId);
}
