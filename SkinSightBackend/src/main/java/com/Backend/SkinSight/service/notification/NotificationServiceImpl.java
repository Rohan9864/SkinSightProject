package com.Backend.SkinSight.service.notification;

import com.Backend.SkinSight.dto.response.NotificationResponseDto;
import com.Backend.SkinSight.entity.Case;
import com.Backend.SkinSight.entity.Notification;
import com.Backend.SkinSight.entity.User;
import com.Backend.SkinSight.enums.NotificationType;
import com.Backend.SkinSight.exception.ResourceNotFoundException;
import com.Backend.SkinSight.mapper.NotificationMapper;
import com.Backend.SkinSight.repository.CaseRepository;
import com.Backend.SkinSight.repository.NotificationRepository;
import com.Backend.SkinSight.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService{
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private NotificationMapper notificationMapper;
    @Override
    public void sendNotification(Long recipientId, NotificationType type, String message, Long relatedCaseId) {
        User recipient=userRepository.findById(recipientId).orElseThrow(()->
                new ResourceNotFoundException("Recipient not found: " + recipientId));

        Case relatedCase = caseRepository.findById(relatedCaseId).orElse(null);

        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .message(message)
                .isRead(false)
                .relatedCase(relatedCase)
                .build();

        notificationRepository.save(notification);

    }

    @Override
    public List<NotificationResponseDto> getMyNotifications(Long userId) {
        List<Notification> notifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId);

        return notifications.stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());

    }

    @Override
    public List<NotificationResponseDto> getUnreadNotification(Long userId) {
        List<Notification> notifications = notificationRepository.findByRecipientIdAndIsRead(userId,false);

        return notifications.stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public long countUnread(Long userId) {
        return notificationRepository.countByRecipientIdAndIsRead(userId,false);

    }

    @Override
    public void markAsRead(Long notificationId) {

        Notification notification = notificationRepository.findById(notificationId).orElseThrow(() ->
                new ResourceNotFoundException("Notification not found: " + notificationId));

        notification.setRead(true);

        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndIsRead(userId,false);

        unread.forEach(n->n.setRead(true));

        notificationRepository.saveAll(unread);
    }
}
