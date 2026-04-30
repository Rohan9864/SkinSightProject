package com.Backend.SkinSight.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "doctor_profiles")
@Builder
public class DoctorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_Id", nullable = false,unique = true)
    private User user;

    @Column(nullable = false)
    private String specialization;

    @Column(nullable = false,unique = true)
    private String licenseNumber;

    private String phone;

    private String hospitalAffiliation;

    private Integer yearsOfExperience;

}
