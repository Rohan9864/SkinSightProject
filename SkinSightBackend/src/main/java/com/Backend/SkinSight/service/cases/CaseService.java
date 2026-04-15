package com.Backend.SkinSight.service.cases;

import com.Backend.SkinSight.dto.request.CreateCaseRequestDto;
import com.Backend.SkinSight.dto.response.CaseResponseDto;

import java.util.List;

public interface CaseService {
    CaseResponseDto createCase(Long patientId, CreateCaseRequestDto dto);

    CaseResponseDto getCaseById(Long caseId);

    List<CaseResponseDto> getMyCases(Long patientId);

    List<CaseResponseDto> getPendingCases();

    List<CaseResponseDto> getAllCases();

    void updateCaseStatus(Long caseId, String status);

    CaseResponseDto assignCaseToDoctor(Long caseId, Long doctorId);

    List<CaseResponseDto> getMyAssignedCases(Long doctorId);

    List<CaseResponseDto> getUnassignedCases();


}
