package com.Backend.SkinSight.mapper;

import com.Backend.SkinSight.dto.response.DoctorReviewResponseDto;
import com.Backend.SkinSight.entity.DoctorReview;
import org.springframework.stereotype.Component;

@Component
public class DoctorReviewMapper {

    public DoctorReviewResponseDto toDto(DoctorReview review){
        if (review==null){
            return null;
        }

        return DoctorReviewResponseDto.builder()
                .id(review.getId())
                .doctorId(review.getDoctor().getId())
                .doctorName(review.getDoctor().getName())
                .action(review.getAction().name())
                .overriddenClass(review.getOverriddenClass())
                .overrideReason(review.getOverriddenReason())
                .clinicalNotes(review.getClinicalNotes())
                .recommendations(review.getRecommendations())
                .reviewedAt(review.getReviewedAt())
                .releasedAt(review.getReleasedAt())
                .build();
    }
}
