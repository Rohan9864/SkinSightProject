package com.Backend.SkinSight.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MLRequestDto {

    @JsonProperty("case_id")
    private Long caseId;

    @JsonProperty("image_url")
    private String imageUrl;
}
