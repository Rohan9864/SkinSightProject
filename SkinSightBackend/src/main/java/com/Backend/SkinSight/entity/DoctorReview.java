package com.Backend.SkinSight.entity;

import com.Backend.SkinSight.enums.ReviewAction;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id",nullable = false,unique = true)
    private Case skinCase;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id",nullable = false)
    private User doctor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewAction action;

    private String overriddenClass;

    @Column(columnDefinition = "TEXT")
    private String overriddenReason;

    @Column(columnDefinition = "TEXT")
    private String clinicalNotes;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    private LocalDateTime reviewedAt;

    private LocalDateTime releasedAt;

}
