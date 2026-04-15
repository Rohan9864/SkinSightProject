package com.Backend.SkinSight.repository;

import com.Backend.SkinSight.entity.DiagnosisResult;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DiagnosisResultRepository extends JpaRepository<DiagnosisResult,Long> {

    Optional<DiagnosisResult> findBySkinCaseId(Long caseId);

    boolean existsBySkinCaseId(Long caseId);


}
