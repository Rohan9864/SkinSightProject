package com.Backend.SkinSight.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateDoctorProfileRequestDto {

    @Size(min = 2, message = "Specialization too short")
    private String specialization;

    @Size(max = 15,message = "Phone number too long")
    private String phone;

    private String hospitalAffiliation;

    @Min(value = 0, message = "Years of Experience cannot be Negative")
    private Integer yearsOfExperience;


}
