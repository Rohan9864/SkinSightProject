package com.Backend.SkinSight.repository;

import com.Backend.SkinSight.entity.Case;
import com.Backend.SkinSight.enums.CaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseRepository extends JpaRepository<Case,Long> {

    List<Case> findByPatientId(Long patientId);

    List<Case> findByPatientIdOrderBySubmittedAtDesc(Long patientId);

    List<Case> findByStatus(CaseStatus status);

    List<Case> findByStatusOrderBySubmittedAtAsc(CaseStatus status);

    long countByPatientId(Long patientId);

    List<Case> findByAssignedDoctorIdAndStatus(
            Long doctorId, CaseStatus status);

    List<Case> findByAssignedDoctorId(Long doctorId);

    List<Case> findByStatusAndAssignedDoctorIsNull(
            CaseStatus status);
}
