package com.Backend.SkinSight.repository;

import com.Backend.SkinSight.entity.DoctorReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorReviewRepository extends JpaRepository<DoctorReview, Long> {

    Optional<DoctorReview> findBySkinCaseId(Long caseId);

    List<DoctorReview> findByDoctorId(Long doctorId);

    long countByDoctorId(Long doctorId);
}
