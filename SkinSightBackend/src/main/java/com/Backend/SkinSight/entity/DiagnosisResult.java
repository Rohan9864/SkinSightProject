package com.Backend.SkinSight.entity;

import com.Backend.SkinSight.enums.SeverityLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "diagnosis_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id",nullable = false,unique = true)
    public Case skinCase;

    @Column(nullable = false)
    public String predictedClass;

    @Column(columnDefinition = "TEXT",nullable = false)
    private String confidenceScores;

    @Column(nullable = false)
    private String heatMapUrl;

    @Column(nullable = false)
    private Double severityScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeverityLevel severityLevel;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;



}
