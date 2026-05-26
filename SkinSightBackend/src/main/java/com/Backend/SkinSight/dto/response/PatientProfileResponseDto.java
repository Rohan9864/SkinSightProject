package com.Backend.SkinSight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor@Builder
public class PatientProfileResponseDto {

    private Long id;

    private Long userId;

    private String name;

    private String email;

    private Integer age;

    private String gender;

    private String phone;

    private String address;

    private LocalDateTime createdAt;

    private String medicalHistory;

}
