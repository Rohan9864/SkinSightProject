package com.Backend.SkinSight.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig {

    @Value("${app.upload.cases.dir}")
    private String caseUploadDir;

    @Value("${app.upload.heatmaps.dir}")
    private String heatMapUploadDir;

    @Value("${app.upload.reports.dir}")
    private String reportUploadDir;

    @PostConstruct
    public void createUploadDirectories(){
        createDirIfNOtExists(caseUploadDir);

        createDirIfNOtExists(heatMapUploadDir);

        createDirIfNOtExists(reportUploadDir);
    }

    private void createDirIfNOtExists(String dirPAth) {
        try {
            Files.createDirectories(Paths.get(dirPAth));
        } catch (IOException e){
            throw new RuntimeException( "Could not create upload directory: " + dirPAth,e);
        }
    }
}
