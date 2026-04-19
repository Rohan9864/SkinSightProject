package com.Backend.SkinSight.service.notification;

import com.Backend.SkinSight.dto.response.NotificationResponseDto;
import com.Backend.SkinSight.enums.NotificationType;

import java.util.List;

public interface NotificationService {
    void sendNotification(Long recipientId,
                          NotificationType type,
                          String message,
                          Long relatedCaseId);

    List<NotificationResponseDto> getMyNotifications(Long userId);

    List<NotificationResponseDto>getUnreadNotification(Long userId);

    long countUnread(Long userId);

    void markAsRead(Long notificationId);

    void markAllAsRead(Long userId);

}
