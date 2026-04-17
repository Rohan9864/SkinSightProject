package com.Backend.SkinSight.repository;

import com.Backend.SkinSight.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReportRepository extends JpaRepository<Report,Long> {
    Optional<Report> findBySkinCaseId(Long caseId);

    boolean existsBySkinCaseId(Long caseId);

    List<Report> findByGeneratedById(Long doctorId);
}
