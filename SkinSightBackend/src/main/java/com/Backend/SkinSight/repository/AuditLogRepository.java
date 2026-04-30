package com.Backend.SkinSight.repository;

import com.Backend.SkinSight.entity.AuditLog;
import com.Backend.SkinSight.enums.AuditAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog,Long> {

    List<AuditLog> findByPerformedByIdOrderByPerformedAtDesc(Long userId);

    List<AuditLog> findByTargetEntityAndTargetId(String targetEntity, Long targetId);

    List<AuditLog> findByAction(AuditAction action);

    List<AuditLog> findAllByOrderByPerformedAtDesc();

}
