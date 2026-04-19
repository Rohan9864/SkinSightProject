package com.Backend.SkinSight.mapper;

import com.Backend.SkinSight.dto.response.NotificationResponseDto;
import com.Backend.SkinSight.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponseDto toDto(Notification notification){
        if (notification==null){
            return null;
        }

        return NotificationResponseDto.builder()
                .id(notification.getId())
                .type(notification.getType().name())
                .message(notification.getMessage())
                .isRead(notification.isRead())
                .relatedCaseId(notification.getRelatedCase()!=null
                        ? notification.getRelatedCase().getId()
                        :null)
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
