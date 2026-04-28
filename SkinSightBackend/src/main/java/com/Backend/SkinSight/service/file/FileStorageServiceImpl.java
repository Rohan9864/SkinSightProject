package com.Backend.SkinSight.service.file;

import com.Backend.SkinSight.dto.response.FileUploadResponseDto;
import com.Backend.SkinSight.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
public class FileStorageServiceImpl implements FileStorageService{

    @Value("${app.upload.cases.dir}")
    private String caseUploadDir;

    @Value("${app.upload.max-size}")
    private long maxFileSize;

    private static final List<String> ALLOWED_TYPES =
            Arrays.asList(
                    "image/jpeg",
                    "image/jpg",
                    "image/png");

    @Override
    public FileUploadResponseDto storeCaseImage(MultipartFile file, Long caseId) {

        if (file == null || file.isEmpty()){
            throw new BadRequestException( "Please select an image file to upload.");
        }

        if (!isValidImageType(file)){
            throw new BadRequestException("Invalid File type" +
                    "Only JPG and PNG images are allowed");
        }

        if (file.getSize()>maxFileSize){
            throw new BadRequestException("File size exceeds the maximum" +
                    "allowed size of 10 MB");
        }
        String originalFileName = file.getOriginalFilename();

        String fileExtension = getFileExtension(originalFileName);

        String uniqueFileName= "case_"
                + caseId
                + "_"
                +System.currentTimeMillis()
                +fileExtension;

        Path targetLocation = Paths
                .get(caseUploadDir)
                .resolve(uniqueFileName);
        try {
            Files.copy(
                    file.getInputStream(),
                    targetLocation,
                    StandardCopyOption.REPLACE_EXISTING);

            log.info(
                    "Saved Image for case {} : {}",
                    caseId,targetLocation);
        }catch (IOException e){
            log.error("Failed to save image for case {} : {}", caseId,e.getMessage());
            throw new BadRequestException(
                    "Failed to save the uploaded image. "
                            + "Please try again.");
        }

        return FileUploadResponseDto.builder()
                .fileName(uniqueFileName)
                .filePath(targetLocation.toString())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .build();
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")){
            return ".jpg";
        }
        return fileName.substring(
                fileName.lastIndexOf("."));
    }

    @Override
    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
            log.info("Deleted file : {}",filePath);
        }catch (IOException e){
            log.error("Failed to delete file {} : {}",filePath,e.getMessage());
        }

    }

    @Override
    public boolean isValidImageType(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType !=null
                && ALLOWED_TYPES.contains(contentType);
    }
}
