package com.Backend.SkinSight.client;

import com.Backend.SkinSight.dto.request.MLRequestDto;
import com.Backend.SkinSight.dto.response.MLResponseDto;
import com.Backend.SkinSight.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.*;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.Objects;

@Component
@Slf4j
public class MLServiceClient {

    @Autowired
    private RestClient restClient;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${ml.service.endpoint:/api/analyze/}")
    private String mlEndpoint;

    public MLResponseDto analyzeImage(
            Long caseId,
            String imageUrl) {

        String jsonBody;

        try {
            Map<String, Object> requestMap = Map.of(
                    "case_id",   caseId,
                    "image_url", imageUrl);

            jsonBody = objectMapper.writeValueAsString(requestMap);

        }catch (Exception e){
            throw new BadRequestException("Failed to serialize ML request: "
                    + e.getMessage());
        }

        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("ML REQUEST");
        log.info("Endpoint: {}", mlEndpoint);
        log.info("Body:     {}", jsonBody);
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        try {
            String responseBody = restClient
                    .post()
                    .uri(mlEndpoint)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(jsonBody)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError()
                                    || status.is5xxServerError(),
                            (request, response) -> {
                                // Read error response body
                                byte[] bytes = response
                                        .getBody()
                                        .readAllBytes();
                                String errBody =
                                        new String(bytes);
                                log.error(
                                        "Django error response: {}",
                                        errBody);
                                throw new BadRequestException(
                                        "ML service error: "
                                                + errBody);
                            })
                    .body(String.class);

            MLResponseDto result = objectMapper.readValue(
                    responseBody,
                    MLResponseDto.class);

            if (result == null){
                throw new BadRequestException("ML service returned empty response.");
            }

            if (!result.isSuccess()) {
                log.error("Django failure: {}",
                        result.getErrorMessage());
                throw new BadRequestException(
                        "AI analysis failed: "
                                + result.getErrorMessage());
            }

            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.info("ML RESPONSE");
            log.info("Predicted: {}",
                    result.getPredictedClass());
            log.info("Severity:  {}",
                    result.getSeverityLevel());
            log.info("Score:     {}",
                    result.getSeverityScore());
            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

            return result;
        } catch (ResourceAccessException e){
            log.error("ML service unreachable: {}",
                    e.getMessage());
            throw new BadRequestException(
                    "Cannot reach ML service. "
                            + "Is Django running on port 8000?");
        }catch (RestClientResponseException e){
            log.error("ML HTTP error {}: {}",
                    e.getStatusCode(),
                    e.getResponseBodyAsString());
            throw new BadRequestException("ML service HTTP error: "
                    + e.getStatusCode());
        }catch (BadRequestException e){
            throw e;
        }catch (Exception e){
            log.error("Unexpected ML error: {}",
                    e.getMessage());
            throw new BadRequestException(
                    "Unexpected ML error: "
                            + e.getMessage());
        }
    }
}