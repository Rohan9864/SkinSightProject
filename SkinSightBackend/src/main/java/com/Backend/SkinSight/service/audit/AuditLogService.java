package com.Backend.SkinSight.service.audit;

import com.Backend.SkinSight.dto.response.AuditLogResponseDto;
import com.Backend.SkinSight.enums.AuditAction;

import java.util.List;

public interface AuditLogService {

    void log(Long performedById,
             AuditAction action,
             String targetEntity,
             Long targetId,
             String details);

    List<AuditLogResponseDto> getAllLogs();

    List<AuditLogResponseDto> getLogsByUser(Long userId);

    List<AuditLogResponseDto> getLogsByTarget(String targetEntity,Long targetId);

    List<AuditLogResponseDto> getLogsByAction(String action);

}
