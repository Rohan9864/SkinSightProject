package com.Backend.SkinSight.repository;

import com.Backend.SkinSight.entity.Report;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report,Long> {
    Optional<Report> findBySkinCaseId(Long caseId);

    boolean existsBySkinCaseId(Long caseId);

    List<Report> findByGeneratedById(Long doctorId);
}
