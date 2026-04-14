package com.Backend.SkinSight.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdatePatientProfileRequestDto {

    @Min(value = 1,message = "Age must be at least 1 year ")
    @Max(value = 130,message = "Age cannot exceed 130 ")
    private Integer age;

    private String gender;

    @Size(max = 15,message = "phone number is too long")
    private String phone;

    private String address;

    @Size(max = 1000,message = "Medical history cannot exceed 1000 characters")
    private String medicalHistory;

}
