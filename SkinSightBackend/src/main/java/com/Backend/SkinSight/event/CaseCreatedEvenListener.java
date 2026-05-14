package com.Backend.SkinSight.event;

import com.Backend.SkinSight.service.diagnosis.DiagnosisResultService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
public class CaseCreatedEvenListener {
    @Autowired
    private DiagnosisResultService diagnosisResultService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCaseCreated(CaseCreatedEvent event){
        log.info("Event received: case {} committed. "
                + "Starting ML processing...",event.getCaseId());

        try {
            diagnosisResultService.processAndSaveResult(event.getCaseId());
            log.info("ML processing SUCCESS "
                    + "for case {}",event.getCaseId());
        }catch (Exception e){
            log.error("━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.error("ML FAILED for case {}",event.getCaseId());
            log.error("Type:    {}",e.getClass().getSimpleName());
            log.error("Message: {}",e.getMessage());
            log.error("━━━━━━━━━━━━━━━━━━━━━━━━━");
        }
    }
}
