package com.Backend.SkinSight.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorProfileResponseDto {
    private Long id;

    private Long userId;

    private String name;

    private String email;

    private String specialization;

    private String licenseNumber;

    private String phone;

    private String hospitalAffiliation;

    private Integer yearsOfExperience;

}
