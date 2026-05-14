package com.Backend.SkinSight.client;

import com.Backend.SkinSight.dto.request.MLRequestDto;
import com.Backend.SkinSight.dto.response.MLResponseDto;
import com.Backend.SkinSight.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;



@Component
@Slf4j
public class MLServiceClient {
    @Autowired
    private RestTemplate restTemplate;

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    @Value("${ml.service.endpoint:/api/analyze}")
    private String mlServiceEndpoint;

    public MLResponseDto analyzeImage(
            Long caseId,
            String imageUrl) {

        MLRequestDto requestBody = MLRequestDto.builder()
                .caseId(caseId)
                .imageUrl(imageUrl)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<MLRequestDto> entity =
                new HttpEntity<>(requestBody, headers);

        String fullUrl = mlServiceUrl + mlServiceEndpoint;

        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("ML REQUEST");
        log.info("URL:      {}", fullUrl);
        log.info("Case ID:  {}", caseId);
        log.info("Image:    {}", imageUrl);
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        try {
            ResponseEntity<MLResponseDto> response =
                    restTemplate.postForEntity(
                            fullUrl,
                            entity,
                            MLResponseDto.class);

            MLResponseDto result = response.getBody();

            log.info("ML RESPONSE");
            log.info("Status:    {}",
                    response.getStatusCode());
            log.info("Success:   {}",
                    result != null
                            ? result.isSuccess()
                            : "null body");

            if (result == null) {
                throw new BadRequestException(
                        "ML service returned empty response.");
            }

            if (!result.isSuccess()) {
                log.error("ML returned failure: {}",
                        result.getErrorMessage());
                throw new BadRequestException(
                        "AI analysis failed: "
                                + result.getErrorMessage());
            }

            log.info("Predicted: {}",
                    result.getPredictedClass());
            log.info("Severity:  {}",
                    result.getSeverityLevel());

            return result;

        } catch (RestClientException e) {
            log.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.error("ML CONNECTION FAILED");
            log.error("URL:   {}", fullUrl);
            log.error("Type:  {}",
                    e.getClass().getSimpleName());
            log.error("Error: {}", e.getMessage());
            log.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            throw new BadRequestException(
                    "Could not reach ML service. "
                            + "Is Django running on port 8000? "
                            + "Error: " + e.getMessage());
        }
    }

}
