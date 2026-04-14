package com.Backend.SkinSight.controller;

import com.Backend.SkinSight.dto.request.UpdateUserRequestDto;
import com.Backend.SkinSight.dto.response.UserResponseDto;
import com.Backend.SkinSight.service.user.UserService;
import jakarta.validation.Valid;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/doctors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getAllDoctors(){
        List<UserResponseDto> doctors = userService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/patients")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getAllPatients(){
        List<UserResponseDto> patients = userService.getAllPatients();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id){
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> toggleStatus(@PathVariable Long id){
        userService.toggleAccountStatus(id);
        return ResponseEntity.ok("Account status updated successfully");
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<UserResponseDto> getMyProfile(
            @RequestAttribute("userId") Long id){
        return ResponseEntity.ok(userService.getMyProfile(id));
    }

    public ResponseEntity<UserResponseDto> updateMyProfile(@RequestAttribute("userId") Long id,
                                                           @Valid @RequestBody UpdateUserRequestDto dto){
        return ResponseEntity.ok(userService.updateMyProfile(id,dto));
    }






}
