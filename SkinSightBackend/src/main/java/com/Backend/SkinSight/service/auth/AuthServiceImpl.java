package com.Backend.SkinSight.service.auth;

import com.Backend.SkinSight.dto.request.*;
import com.Backend.SkinSight.dto.response.AuthResponseDto;
import com.Backend.SkinSight.dto.response.UserResponseDto;
import com.Backend.SkinSight.entity.DoctorProfile;
import com.Backend.SkinSight.entity.PatientProfile;
import com.Backend.SkinSight.entity.User;
import com.Backend.SkinSight.enums.AuditAction;
import com.Backend.SkinSight.enums.Role;
import com.Backend.SkinSight.exception.ConflictException;
import com.Backend.SkinSight.exception.UnauthorizedException;
import com.Backend.SkinSight.mapper.UserMapper;
import com.Backend.SkinSight.repository.DoctorProfileRepository;
import com.Backend.SkinSight.repository.PatientProfileRepository;
import com.Backend.SkinSight.repository.UserRepository;
import com.Backend.SkinSight.security.JwtUtil;
import com.Backend.SkinSight.service.EmailService;
import com.Backend.SkinSight.service.audit.AuditLogService;
import com.Backend.SkinSight.service.token.EmailVerificationTokenService;
import com.Backend.SkinSight.service.token.PasswordResetTokenService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Transactional
public class AuthServiceImpl implements AuthService{

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientProfileRepository patientProfileRepository;

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private EmailService emailService;

    @Autowired
    private EmailVerificationTokenService emailVerificationTokenService;

    @Autowired
    private PasswordResetTokenService passwordResetTokenService;

    @Autowired
    private AuditLogService auditLogService;


    @Override
    public void register(RegisterRequestDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())){
            throw new ConflictException("An account with this email already exists.");
        }

        User user= User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(Role.PATIENT)
                .isActive(true)
                .isEmailVerified(false)
                .build();

        userRepository.save(user);

        PatientProfile profile = PatientProfile.builder()
                .user(user)
                .build();

        patientProfileRepository.save(profile);

        String tokenValue = emailVerificationTokenService.createToken(user);
        emailService.sendVerificationEmail(
                user.getEmail(),
                user.getName(),
                tokenValue);

    }

    @Override
    public AuthResponseDto login(LoginRequestDto dto) {
        User user = userRepository.findByEmail(dto.getEmail()).orElseThrow(()->
                new BadCredentialsException( "Invalid email or password."));
        if(!passwordEncoder.matches(
                dto.getPassword(),
                user.getPassword())){
            throw new BadCredentialsException("Invalid email or password.");
        }

        if (!user.isEmailVerified()){
            throw new UnauthorizedException("Please verify your email address "
                    + "before logging in. Check your inbox.");
        }

        if (!user.isActive()){
            throw new UnauthorizedException(
                    "Your account has been deactivated. "
                            + "Please contact the administrator.");
        }
        String token = jwtUtil.generateToken(user);

        return AuthResponseDto.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();

    }

    @Override
    public void verifyEmail(String token) {
        emailVerificationTokenService.verifyToken(token);

    }

    @Override
    public void forgotPassword(PasswordResetRequestDto dto) {
        passwordResetTokenService.createTokenAndSendMail(dto.getEmail());

    }

    @Override
    public void resetPassword(NewPasswordRequestDto dto) {
        passwordResetTokenService.resetPassword(dto.getToken(),
                dto.getNewPassword());

    }

    @Override
    public UserResponseDto createDoctor(Long adminId, CreateDoctorRequestDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())){
            throw new ConflictException( "An account with this email already exists.");
        }

        if (doctorProfileRepository.existsByLicenseNumber(dto.getLicenseNumber())){
            throw new ConflictException("A doctor with this license number "
                    + "already exists.");
        }

        String tempPassword = UUID.randomUUID()
                .toString()
                .replace("-","")
                .substring(0,10);

        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(tempPassword))
                .role(Role.DOCTOR)
                .isActive(true)
                .isEmailVerified(true)
                .build();

        userRepository.save(user);

        DoctorProfile profile = DoctorProfile.builder()
                .user(user)
                .specialization(dto.getSpecialization())
                .licenseNumber(dto.getLicenseNumber())
                .phone(dto.getPhone())
                .hospitalAffiliation(dto.getHospitalAffiliation())
                .yearsOfExperience(dto.getYearsOfExperience())
                .build();

        doctorProfileRepository.save(profile);
        emailService.sendDoctorCredentials(
                user.getEmail(),
                user.getPassword(),
                tempPassword);

        auditLogService.log(
                adminId,
                AuditAction.DOCTOR_ACCOUNT_CREATED,
                "User",
                user.getId(),
                "Doctor account created for: "
                + user.getName()
                + " (" + dto.getEmail() + ")"
                +  dto.getSpecialization()
                +" | License: "
                +dto.getLicenseNumber());

        return userMapper.toDto(user);
    }
}
