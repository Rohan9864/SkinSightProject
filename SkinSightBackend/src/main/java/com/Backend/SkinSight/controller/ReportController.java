package com.Backend.SkinSight.controller;

import com.Backend.SkinSight.dto.response.ReportResponseDto;
import com.Backend.SkinSight.service.report.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping("/cases/{caseId}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<ReportResponseDto> generateReport(
            @PathVariable Long caseId,
            @RequestAttribute("userId") Long userId){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reportService.generateReport(caseId,userId));
    }

    @GetMapping("/cases/{caseId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<ReportResponseDto>getReportByCase(@PathVariable Long caseId){
        ReportResponseDto response = reportService.getReportByCase(caseId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{reportId}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR', 'ADMIN')")
    public ResponseEntity<ReportResponseDto> getReportById(@PathVariable Long reportId){
        ReportResponseDto response = reportService.getReportById(reportId);

        return ResponseEntity.ok(response);
    }
}
