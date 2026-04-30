package com.Backend.SkinSight.controller;

import com.Backend.SkinSight.dto.request.DoctorReviewRequestDto;
import com.Backend.SkinSight.dto.response.DoctorReviewResponseDto;
import com.Backend.SkinSight.service.review.DoctorReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class DoctorReviewController {

    @Autowired
    private DoctorReviewService reviewService;

    @PostMapping("/cases/{caseId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorReviewResponseDto> submitReview(
            @RequestAttribute("userId") Long doctorId,
            @PathVariable Long caseId,
            @Valid @RequestBody DoctorReviewRequestDto dto){
        DoctorReviewResponseDto response = reviewService.submitReview(doctorId,caseId,dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/cases/{caseId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<DoctorReviewResponseDto>getReviewByCaseId(
            @PathVariable Long caseId){
        return ResponseEntity.ok(reviewService.getReviewByCaseId(caseId));

    }

    public ResponseEntity<List<DoctorReviewResponseDto>> getMyReviews(
            @RequestAttribute("userId") Long doctorId){

        return ResponseEntity.ok(reviewService.getMyReviews(doctorId));

    }

}
