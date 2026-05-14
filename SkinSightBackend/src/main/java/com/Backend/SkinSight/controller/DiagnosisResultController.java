package com.Backend.SkinSight.controller;

import com.Backend.SkinSight.dto.response.DiagnosisResultResponseDto;
import com.Backend.SkinSight.service.diagnosis.DiagnosisResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/diagnosis")
public class DiagnosisResultController {

    @Autowired
    private DiagnosisResultService diagnosisResultService;

    @PostMapping("/process/{caseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiagnosisResultResponseDto> processCase(@PathVariable Long caseId){

        return ResponseEntity.ok(diagnosisResultService.processAndSaveResult(caseId));
    }

    @GetMapping("/cases/{caseId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<DiagnosisResultResponseDto> getResultByCase(@PathVariable Long caseId){

        return ResponseEntity.ok(diagnosisResultService.getResultByCase(caseId));

    }
}
