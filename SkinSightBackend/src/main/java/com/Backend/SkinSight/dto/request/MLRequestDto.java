package com.Backend.SkinSight.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MLRequestDto {

    private Long caseId;

    private String ImageUrl;
}
