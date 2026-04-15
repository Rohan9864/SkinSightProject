package com.Backend.SkinSight.entity;

import com.Backend.SkinSight.enums.CaseStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Case {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id",nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_doctor_id")
    private User assignedDoctor;

    @Column(nullable = false)
    private String imageUrl;

    private String bodyArea;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String duration;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime submittedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "skinCase",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    private DiagnosisResult diagnosisResult;

    @OneToOne(mappedBy = "skinCase",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    private DoctorReview doctorReview;




}
