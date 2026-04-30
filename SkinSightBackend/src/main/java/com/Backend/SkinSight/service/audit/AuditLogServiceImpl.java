package com.Backend.SkinSight.service.audit;

import com.Backend.SkinSight.dto.response.AuditLogResponseDto;
import com.Backend.SkinSight.entity.AuditLog;
import com.Backend.SkinSight.entity.User;
import com.Backend.SkinSight.enums.AuditAction;
import com.Backend.SkinSight.exception.ResourceNotFoundException;
import com.Backend.SkinSight.mapper.AuditLogMapper;
import com.Backend.SkinSight.repository.AuditLogRepository;
import com.Backend.SkinSight.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class AuditLogServiceImpl implements AuditLogService{

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogMapper auditLogMapper;
    @Override
    public void log(Long performedById,
                    AuditAction action,
                    String targetEntity,
                    Long targetId,
                    String details) {

        User performedBy = userRepository.findById(performedById).orElseThrow(()->
                new ResourceNotFoundException( "User not found: "
                        + performedById));

        AuditLog auditLog = AuditLog.builder()
                .performedBy(performedBy)
                .action(action)
                .targetEntity(targetEntity)
                .targetId(targetId)
                .details(details)
                .build();

        auditLogRepository.save(auditLog);

        log.info(
                "Audit log created - Action : {}," +
                        "By : {} ( ID : {} )," +
                        "Target : {} #{}",
                action,
                performedBy.getName(),
                performedById,
                targetEntity,
                targetId);
    }

    @Override
    public List<AuditLogResponseDto> getAllLogs() {
        return auditLogRepository.findAllByOrderByPerformedAtDesc()
                .stream()
                .map(auditLogMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AuditLogResponseDto> getLogsByUser(Long userId) {
        return auditLogRepository.findByPerformedByIdOrderByPerformedAtDesc(userId)
                .stream()
                .map(auditLogMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AuditLogResponseDto> getLogsByTarget(String targetEntity, Long targetId) {
       return auditLogRepository.findByTargetEntityAndTargetId(targetEntity,targetId)
               .stream()
               .map(auditLogMapper::toDto)
               .collect(Collectors.toList());
    }

    @Override
    public List<AuditLogResponseDto> getLogsByAction(String action) {
        AuditAction auditAction;
        try {
            auditAction=AuditAction.valueOf(action.toUpperCase());
        }catch (IllegalArgumentException e){
            throw new ResourceNotFoundException("Invalid action type: " + action);
        }

        return auditLogRepository.findByAction(auditAction)
                .stream()
                .map(auditLogMapper::toDto)
                .collect(Collectors.toList());
    }
}
