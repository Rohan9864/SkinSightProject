package com.Backend.SkinSight.service.review;

import com.Backend.SkinSight.dto.request.DoctorReviewRequestDto;
import com.Backend.SkinSight.dto.response.CaseResponseDto;
import com.Backend.SkinSight.dto.response.DoctorReviewResponseDto;
import com.Backend.SkinSight.entity.Case;
import com.Backend.SkinSight.entity.DoctorReview;
import com.Backend.SkinSight.entity.User;
import com.Backend.SkinSight.enums.CaseStatus;
import com.Backend.SkinSight.enums.NotificationType;
import com.Backend.SkinSight.enums.ReviewAction;
import com.Backend.SkinSight.exception.BadRequestException;
import com.Backend.SkinSight.exception.ResourceNotFoundException;
import com.Backend.SkinSight.mapper.DoctorReviewMapper;
import com.Backend.SkinSight.repository.CaseRepository;
import com.Backend.SkinSight.repository.DoctorReviewRepository;
import com.Backend.SkinSight.repository.UserRepository;
import com.Backend.SkinSight.service.EmailService;
import com.Backend.SkinSight.service.notification.NotificationService;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.Email;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Service
@Transactional
public class DoctorReviewServiceImpl implements DoctorReviewService{
    @Autowired
    private DoctorReviewRepository doctorReviewRepository;
    @Autowired
    private CaseRepository caseRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private DoctorReviewMapper doctorReviewMapper;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    EmailService emailService;


    @Override
    public DoctorReviewResponseDto submitReview(Long doctorId,
                                                Long caseId,
                                                DoctorReviewRequestDto dto) {
        Case skinCase = caseRepository.findById(caseId).orElseThrow(()->
                new ResourceNotFoundException("Case not found with id: " + caseId));

        if (skinCase.getStatus()!= CaseStatus.UNDER_REVIEW){
            throw new BadRequestException( "Case is not available for review. " +
                    "Current status: " + skinCase.getStatus());
        }

        User doctor = userRepository.findById(doctorId).orElseThrow(()->
                new ResourceNotFoundException("Doctor not found"));

        if (dto.getAction()== ReviewAction.OVERRIDDEN){
            if (dto.getOverriddenClass()==null || dto.getOverriddenClass().isBlank()){
                throw new BadRequestException("Overridden class is required" +
                        "when action is OVERRIDDEN");
            }
            if (dto.getOverriddenReason()==null || dto.getOverriddenReason().isBlank()){
                throw new BadRequestException("Override Reason is required" +
                        "When Action is OVERRIDDEN");
            }
        }

        if (dto.getAction()!=ReviewAction.RESUBMISSION_REQUESTED &&
                (dto.getClinicalNotes()==null || dto.getClinicalNotes().isBlank())){
            throw new BadRequestException("Clinical notes are required" +
                    "when confirming or overriding a diagnosis");
        }

        DoctorReview review = DoctorReview.builder()
                .skinCase(skinCase)
                .doctor(doctor)
                .action(dto.getAction())
                .overriddenClass(dto.getOverriddenClass())
                .overriddenReason(dto.getOverriddenReason())
                .clinicalNotes(dto.getClinicalNotes())
                .recommendations(dto.getRecommendations())
                .reviewedAt(LocalDateTime.now())
                .build();

        if (dto.getAction()==ReviewAction.CONFIRMED
                || dto.getAction()==ReviewAction.OVERRIDDEN){
            skinCase.setStatus(CaseStatus.RELEASED);
            review.setReleasedAt(LocalDateTime.now());
        } else if (dto.getAction()
                ==ReviewAction.RESUBMISSION_REQUESTED) {
           skinCase.setStatus(CaseStatus.RESUBMISSION_REQUIRED);

        }

        caseRepository.save(skinCase);

        DoctorReview savedReview= doctorReviewRepository.save(review);

        User patient = skinCase.getPatient();

        if (dto.getAction() == ReviewAction.CONFIRMED
        || dto.getAction()==ReviewAction.OVERRIDDEN){
            notificationService.sendNotification(
                    patient.getId(),
                    NotificationType.RESULT_READY,
                    "Your diagnosis result for Case #"
                            + caseId + " is now available. "
                            + "Log in to view your result.",
                    caseId);
            emailService.sendResultReadyEmail(
                    patient.getEmail(),
                    patient.getName(),
                    caseId);
            
        } else if (dto.getAction()==ReviewAction.RESUBMISSION_REQUESTED) {
            notificationService.sendNotification(
                    patient.getId(),
                    NotificationType.RESUBMISSION_REQUIRED,
                    "The doctor has reviewed Case #"
                            + caseId + " and requires a new image. "
                            + "Please check the doctor's note.",
                    caseId);
            emailService.sendResubmissionEmail(
                    patient.getEmail(),
                    patient.getName(),
                    caseId,
                    dto.getClinicalNotes());
            
        }
        return doctorReviewMapper.toDto(savedReview);
    }

    @Override
    public DoctorReviewResponseDto getReviewByCaseId(Long caseId) {
        DoctorReview review = doctorReviewRepository.findBySkinCaseId(caseId).orElseThrow(()->
                new ResourceNotFoundException("Review not found for case: " + caseId));
        return doctorReviewMapper.toDto(review);
    }

    @Override
    public List<DoctorReviewResponseDto> getMyReviews(Long doctorId) {
        List<DoctorReview> reviews = doctorReviewRepository.findByDoctorId(doctorId);
        return reviews.stream()
                .map(doctorReviewMapper::toDto)
                .collect(Collectors.toList());
    }
}
