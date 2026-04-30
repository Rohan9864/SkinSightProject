package com.Backend.SkinSight.service.diagnosis;

import com.Backend.SkinSight.dto.response.DiagnosisResultResponseDto;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

public interface DiagnosisResultService {

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    DiagnosisResultResponseDto processAndSaveResult(Long  caseId);

    DiagnosisResultResponseDto getResultByCase(Long caseId);
}
