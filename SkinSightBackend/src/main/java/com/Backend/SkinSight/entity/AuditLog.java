package com.Backend.SkinSight.entity;

import com.Backend.SkinSight.enums.AuditAction;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by",nullable = false)
    private User performedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditAction action;

    @Column(nullable = false)
    private String targetEntity;

    @Column(nullable = false)
    private Long targetId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime performedAt;

}
