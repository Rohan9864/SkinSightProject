package com.Backend.SkinSight.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "patient_profiles")
@Builder
public class PatientProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false,unique = true)
    private User user;

    private Integer age;

    private String gender;

    private String phone;

    private String address;

    @Column(columnDefinition = "TEXT")
    private String MedicalHistory;
}
