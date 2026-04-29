package com.Backend.SkinSight.controller;

import com.Backend.SkinSight.dto.response.AuditLogResponseDto;
import com.Backend.SkinSight.service.audit.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogResponseDto>> getAllLogs(){
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogResponseDto>> getLogsByUser(
            @PathVariable Long userId){
        return ResponseEntity.ok(auditLogService.getLogsByUser(userId));
    }

    @GetMapping("/target/{entity}/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogResponseDto>> getLogsByTarget(
            @PathVariable String entity,
            @PathVariable Long id){
        return ResponseEntity.ok(auditLogService.getLogsByTarget(entity,id));
    }

    @GetMapping("/action/{action}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogResponseDto>> getLogsByAction(
            @PathVariable String action){
        return ResponseEntity.ok(auditLogService.getLogsByAction(action));
    }
}
