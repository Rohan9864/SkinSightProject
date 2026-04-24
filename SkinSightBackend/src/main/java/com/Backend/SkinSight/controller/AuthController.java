package com.Backend.SkinSight.controller;

import com.Backend.SkinSight.dto.request.*;
import com.Backend.SkinSight.dto.response.AuthResponseDto;
import com.Backend.SkinSight.dto.response.UserResponseDto;
import com.Backend.SkinSight.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.Getter;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequestDto dto){
        authService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body("Registration successful. "
                + "Please check your email to "
                + "verify your account.");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(
            @Valid @RequestBody LoginRequestDto dto){
        AuthResponseDto response = authService.login(dto);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(
            @Valid @RequestParam String token){
        authService.verifyEmail(token);
        return ResponseEntity.ok( "Email verified successfully. "
                + "You can now log in.");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody PasswordResetRequestDto dto){
        authService.forgotPassword(dto);

        return ResponseEntity.ok("Password reset link has been sent "
                + "to your email address.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody NewPasswordRequestDto dto){
        authService.resetPassword(dto);
        return ResponseEntity.ok( "Password reset successful. "
                + "You can now log in with "
                + "your new password.");
    }

    public ResponseEntity<UserResponseDto> createDoctor(
            @Valid @RequestBody CreateDoctorRequestDto dto){

        UserResponseDto response = authService.createDoctor(dto);

       return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


}
