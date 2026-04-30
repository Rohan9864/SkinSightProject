package com.Backend.SkinSight.mapper;

import com.Backend.SkinSight.dto.response.AuditLogResponseDto;
import com.Backend.SkinSight.entity.AuditLog;
import org.springframework.stereotype.Component;

@Component
public class AuditLogMapper {

    public AuditLogResponseDto toDto(AuditLog log){
        if (log == null){
            return null;
        }

        return AuditLogResponseDto.builder()
                .id(log.getId())
                .performedByName(log.getPerformedBy().getName())
                .performedById(log.getPerformedBy().getId())
                .performedByRole(log.getPerformedBy().getRole().name())
                .action(log.getAction().name())
                .targetEntity(log.getTargetEntity())
                .targetId(log.getTargetId())
                .details(log.getDetails())
                .performedAt(log.getPerformedAt())
                .build();
    }
}
