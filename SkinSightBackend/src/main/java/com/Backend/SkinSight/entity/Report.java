package com.Backend.SkinSight.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id",nullable = false,unique = true)
    private Case skinCase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by",nullable = false)
    private User generatedBy;

    @Column(nullable = false)
    private String filePath;

    @Column(nullable = false)
    private String reportUrl;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime generatedAt;

}


