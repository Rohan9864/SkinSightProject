package com.Backend.SkinSight.service.report;

import com.Backend.SkinSight.dto.response.ReportResponseDto;

public interface ReportService {
    ReportResponseDto generateReport(Long caseId);

    ReportResponseDto getReportByCase(Long caseId);

    ReportResponseDto getReportById(Long reportId);
}
