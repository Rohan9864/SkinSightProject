package com.Backend.SkinSight.repository;

import com.Backend.SkinSight.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface NotificationRepository extends JpaRepository<Notification,Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    List<Notification> findByRecipientIdAndIsRead(Long recipientId, boolean isRead);

    long countByRecipientIdAndIsRead(Long recipientId,boolean isRead);
}
