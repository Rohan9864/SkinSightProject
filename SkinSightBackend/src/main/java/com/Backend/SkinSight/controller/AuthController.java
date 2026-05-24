package com.Backend.SkinSight.controller;

import com.Backend.SkinSight.dto.request.*;
import com.Backend.SkinSight.dto.response.*;
import com.Backend.SkinSight.exception.BadRequestException;
import com.Backend.SkinSight.service.auth.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.Getter;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequestDto dto) {
        authService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body("Registration successful. "
                + "Please check your email to "
                + "verify your account.");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(
            @Valid @RequestBody LoginRequestDto dto) {
        AuthResponseDto response = authService.login(dto);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify")
    public ResponseEntity<Void> verifyEmail(
            @Valid @RequestParam String token,
            HttpServletResponse response) throws IOException {
        try {
            authService.verifyEmail(token);
            response.sendRedirect(
                    frontendUrl + "/verify?status=success");
        }catch (BadRequestException e){
            String msg =e.getMessage().toLowerCase();
            if (msg.contains("already")){
                response.sendRedirect( 
                        frontendUrl + "/verify?status=already-used");
            } else if (msg.contains("expired")) {
                response.sendRedirect(
                        frontendUrl + "/verify?status=expired");
            } else {
                response.sendRedirect(
                        frontendUrl + "/verify?status=invalid");
            }
        }catch (Exception e){
            response.sendRedirect(
                    frontendUrl + "/verify?status=invalid");
        }
        return ResponseEntity.status(HttpStatus.FOUND).build();


    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody PasswordResetRequestDto dto) {
        authService.forgotPassword(dto);

        return ResponseEntity.ok("Password reset link has been sent "
                + "to your email address.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody NewPasswordRequestDto dto) {
        authService.resetPassword(dto);
        return ResponseEntity.ok("Password reset successful. "
                + "You can now log in with "
                + "your new password.");
    }

    @PostMapping("/create-doctor")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> createDoctor(
            @RequestAttribute("userId") Long adminId,
            @Valid @RequestBody CreateDoctorRequestDto dto) {

        UserResponseDto response = authService.createDoctor(adminId, dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> changePassword(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody ChangePasswordRequestDto dto) {
        authService.changePassword(userId, dto);
        return ResponseEntity.ok("Password changed successfully.");
    }
}

