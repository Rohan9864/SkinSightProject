package com.Backend.SkinSight.service.diagnosis;

import com.Backend.SkinSight.dto.response.DiagnosisResultResponseDto;

public interface DiagnosisResultService {

    DiagnosisResultResponseDto processAndSaveResult(Long  caseId);

    DiagnosisResultResponseDto getResultByCase(Long caseId);
}
