package com.Backend.SkinSight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogResponseDto {

    private Long id;

    private Long performedById;

    private String performedByName;

    private String performedByRole;

    private String action;

    private String targetEntity;

    private Long targetId;

    private String details;

    private LocalDateTime performedAt;


}
