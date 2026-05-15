package com.Backend.SkinSight.client;

import com.Backend.SkinSight.dto.request.MLRequestDto;
import com.Backend.SkinSight.dto.response.MLResponseDto;
import com.Backend.SkinSight.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.*;

@Component
@Slf4j
public class MLServiceClient {

    @Autowired
    private RestClient restClient;

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    @Value("${ml.service.endpoint:/api/analyze/}")
    private String mlEndpoint;

    public MLResponseDto analyzeImage(
            Long caseId,
            String imageUrl) {

        MLRequestDto requestBody = MLRequestDto.builder()
                .caseId(caseId)
                .imageUrl(imageUrl)
                .build();

        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("ML REQUEST");
        log.info("Endpoint: {}", mlEndpoint);
        log.info("Case ID:  {}", caseId);
        log.info("Image:    {}", imageUrl);
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        try {
            MLResponseDto result = restClient
                    .post()
                    .uri(mlEndpoint)
                    .body(requestBody)
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            (request, response) -> {
                                // Read Django's error response body.
                                byte[] bodyBytes =
                                        response.getBody()
                                                .readAllBytes();
                                String responseBody =
                                        new String(bodyBytes);
                                log.error(
                                        "Django returned 4xx: {}",
                                        responseBody);

                                throw new BadRequestException(
                                        "ML service returned error: "
                                                + responseBody);
                            })

                    .onStatus(
                            status -> status.is5xxServerError(),
                            (request, response) -> {
                                byte[] bodyBytes =
                                        response.getBody()
                                                .readAllBytes();
                                String responseBody =
                                        new String(bodyBytes);

                                log.error(
                                        "Django returned 5xx: {}",
                                        responseBody);

                                throw new BadRequestException(
                                        "ML service internal error: "
                                                + responseBody);
                            })

                    .body(MLResponseDto.class);

            if (result == null) {
                throw new BadRequestException(
                        "ML service returned empty response.");
            }

            if (!result.isSuccess()) {
                log.error("Django reported failure: {}",
                        result.getErrorMessage());
                throw new BadRequestException(
                        "AI analysis failed: "
                                + result.getErrorMessage());
            }

            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.info("ML RESPONSE");
            log.info("Predicted: {}",
                    result.getPredictedClass());
            log.info("Confidence: {}",
                    result.getConfidenceScores());
            log.info("Severity:  {}",
                    result.getSeverityLevel());
            log.info("Score:     {}",
                    result.getSeverityScore());
            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

            return result;

        } catch (ResourceAccessException e) {
            log.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.error("ML SERVICE UNREACHABLE");
            log.error("Endpoint: {}{}",
                    "http://localhost:8000", mlEndpoint);
            log.error("Cause: {}", e.getMessage());
            log.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            throw new BadRequestException(
                    "Cannot reach ML service. "
                            + "Is Django running on port 8000? "
                            + e.getMessage());

        } catch (RestClientResponseException e) {
            log.error("ML HTTP error: {} — {}",
                    e.getStatusCode(),
                    e.getResponseBodyAsString());
            throw new BadRequestException(
                    "ML service HTTP error: "
                            + e.getStatusCode()
                            + " — "
                            + e.getResponseBodyAsString());

        } catch (BadRequestException e) {
            throw e;
        }
    }
}