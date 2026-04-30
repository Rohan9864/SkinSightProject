package com.Backend.SkinSight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileUploadResponseDto {

    private String fileName;

    private String filePath;

    private String fileType;

    private long fileSize;

}
