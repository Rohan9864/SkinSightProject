package com.Backend.SkinSight.service.review;

import com.Backend.SkinSight.dto.request.DoctorReviewRequestDto;
import com.Backend.SkinSight.dto.response.DoctorReviewResponseDto;

import java.util.List;

public interface DoctorReviewService {

    DoctorReviewResponseDto submitReview(Long doctorId,
                                         Long caseId,
                                         DoctorReviewRequestDto dto);

    DoctorReviewResponseDto getReviewByCaseId(Long caseId);

    List<DoctorReviewResponseDto> getMyReviews(Long doctorId);

}
