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
            String imageUrl){

        MLRequestDto requestBody = MLRequestDto.builder()
                .caseId(caseId)
                .ImageUrl(imageUrl)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<MLRequestDto> entity = new HttpEntity<>(requestBody,headers);

        String fullUrl =mlServiceUrl + mlServiceEndpoint ;
         log.info("Calling ML service for case: {}",caseId);

         try {
             ResponseEntity<MLResponseDto> response = restTemplate.postForEntity(
                     fullUrl,
                     entity,
                     MLResponseDto.class);

             MLResponseDto result = response.getBody();
             if (result == null || !result.isSuccess()){
                 String errorMsg = result !=null
                         ? result.getErrorMessage()
                         :"No response from ML service";
                 log.error("ML service returned failure "
                                 + "for case {}: {}",
                         caseId, errorMsg);
                 throw new BadRequestException("AI analysis failed: " + errorMsg);

             }

             log.info(
                     "ML service completed analysis" +
                             "for case:{}. Predicted: {}",
                     caseId,result.getPredictedClass());

             return result;
         } catch (RestClientException e){
             log.error( "Failed to connect to ML service "
                             + "for case {}: {}",
                     caseId, e.getMessage());

             throw new BadRequestException("Could not reach the AI service. "
                     + "Please try again later.");

         }
    }
}
