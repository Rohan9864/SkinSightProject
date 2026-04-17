package com.Backend.SkinSight.mapper;

import com.Backend.SkinSight.dto.response.ReportResponseDto;
import com.Backend.SkinSight.entity.Report;
import com.Backend.SkinSight.enums.ReviewAction;
import org.springframework.stereotype.Component;

@Component
public class ReportMapper {

    public ReportResponseDto toDto(Report report){

        if (report==null){
            return null;
        }
        String finalDisease=null;

        if (report.getSkinCase().getDoctorReview()!=null){
            boolean isOverridden = report.getSkinCase()
                    .getDoctorReview()
                    .getAction()== ReviewAction.OVERRIDDEN;

            if (isOverridden){
                finalDisease=report.getSkinCase()
                        .getDoctorReview()
                        .getOverriddenClass();
            }
            else {

            }
        }


        return ReportResponseDto.builder()
                .id()
                .build();
    }

}
