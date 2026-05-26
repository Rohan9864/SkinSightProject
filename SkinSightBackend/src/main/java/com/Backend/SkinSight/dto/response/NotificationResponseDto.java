package com.Backend.SkinSight.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDto {

    private Long id;

    private String type;

    private String message;

    @JsonProperty("isRead")
    private boolean isRead;

    private Long relatedCaseId;

    private LocalDateTime createdAt;

}

