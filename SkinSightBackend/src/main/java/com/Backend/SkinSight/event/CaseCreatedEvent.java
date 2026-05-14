package com.Backend.SkinSight.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CaseCreatedEvent extends ApplicationEvent {

    private final Long caseId;
    private final String imageUrl;
    public CaseCreatedEvent(Object source,
                            Long caseId,
                            String imageUrl) {
        super(source);
        this.caseId=caseId;
        this.imageUrl=imageUrl;
    }
}
