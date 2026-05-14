package com.Backend.SkinSight.controller;

import com.Backend.SkinSight.dto.request.AssignCaseRequestDto;
import com.Backend.SkinSight.dto.request.CreateCaseRequestDto;
import com.Backend.SkinSight.dto.response.CaseResponseDto;
import com.Backend.SkinSight.entity.Case;
import com.Backend.SkinSight.service.cases.CaseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

    @Autowired
    private CaseService caseService;

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<CaseResponseDto> createCase(
            @RequestAttribute("userId") Long patientId,
            @RequestPart("image") MultipartFile image,
            @RequestParam(value = "bodyArea",required = false)
            String bodyArea,
            @RequestParam(value = "description", required = false)
            String description,
            @RequestParam(value = "duration", required = false)
            String duration){

        CreateCaseRequestDto dto = new CreateCaseRequestDto();
        dto.setBodyArea(bodyArea);
        dto.setDescription(description);
        dto.setDuration(duration);

        CaseResponseDto response = caseService.createCase(patientId,image,dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<CaseResponseDto>>getMyCases(
            @RequestAttribute("userId") Long patientId){
        return ResponseEntity.ok(caseService.getMyCases(patientId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<CaseResponseDto> getCaseBYId(
            @PathVariable Long id){
        return ResponseEntity.ok(caseService.getCaseById(id));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<CaseResponseDto>> getPendingCases(){
        return ResponseEntity.ok(caseService.getPendingCases());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CaseResponseDto>>getAllCases(){
        return ResponseEntity.ok(caseService.getAllCases());
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CaseResponseDto> assignCase(
            @RequestAttribute("userId") Long adminId,
            @PathVariable Long id,
            @Valid @RequestBody AssignCaseRequestDto dto){
        CaseResponseDto response = caseService.assignCaseToDoctor(adminId,id,dto.getDoctorId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/assigned/my")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<CaseResponseDto>> getMyAssignedCases(
            @RequestAttribute("userId") Long doctorId){
        return ResponseEntity.ok(caseService.getMyAssignedCases(doctorId));
    }

    @GetMapping("/unassigned")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CaseResponseDto>>getUnassignedCases(){
        return ResponseEntity.ok(caseService.getUnassignedCases());
    }

}
