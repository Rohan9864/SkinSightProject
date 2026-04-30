package com.Backend.SkinSight.controller;

import com.Backend.SkinSight.dto.response.NotificationResponseDto;
import com.Backend.SkinSight.service.notification.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<List<NotificationResponseDto>> getMyNotification(
            @RequestAttribute("userId") Long userId){
        return ResponseEntity.ok(notificationService.getMyNotifications(userId));
    }

    @GetMapping("/my/unread")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<List<NotificationResponseDto>> getUnreadNotifications(
            @RequestAttribute("userId") Long userId){
        return ResponseEntity.ok(notificationService.getUnreadNotification(userId));
    }

    @GetMapping("/my/unread/count")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<Long> countUnread(
            @RequestAttribute("userId") Long userId){
        return ResponseEntity.ok(notificationService.countUnread(userId));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<String>markAsRead(
            @PathVariable Long id){
        notificationService.markAsRead(id);
        return ResponseEntity.ok("Notification marked as read");
    }

    @PatchMapping("/my/read-all")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<String> markAllAsRead(
            @RequestAttribute("userId") Long userId){
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok("All notifications marked as read");
    }

}
