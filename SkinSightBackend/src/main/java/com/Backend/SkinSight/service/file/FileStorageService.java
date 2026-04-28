package com.Backend.SkinSight.service.file;


import com.Backend.SkinSight.dto.response.FileUploadResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    FileUploadResponseDto storeCaseImage(MultipartFile file,Long caseId);

    void deleteFile(String filePath);

    boolean isValidImageType(MultipartFile file);
}
