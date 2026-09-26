package com.Backend.SkinSight.service.token;

import com.Backend.SkinSight.entity.PasswordResetToken;
import com.Backend.SkinSight.entity.User;
import com.Backend.SkinSight.exception.BadRequestException;
import com.Backend.SkinSight.exception.ResourceNotFoundException;
import com.Backend.SkinSight.repository.PasswordResetTokenRepository;
import com.Backend.SkinSight.repository.UserRepository;
import com.Backend.SkinSight.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class PasswordResetTokenServiceImpl implements PasswordResetTokenService{

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Override
    public void createTokenAndSendMail(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No account found with email: " + email
                        ));

        LocalDateTime now = LocalDateTime.now();

        boolean activeToken =
                tokenRepository.existsByUserIdAndExpiresAtAfterAndIsUsedFalse(
                        user.getId(),
                        now
                );

        if (activeToken) {
            throw new BadRequestException(
                    "A password reset link has already been sent. "
                            + "Please check your email."
            );
        }

        PasswordResetToken tokenEntity =
                tokenRepository.findByUserId(user.getId())
                        .orElseGet(() ->
                                PasswordResetToken.builder()
                                        .user(user)
                                        .build()
                        );

        String tokenValue = UUID.randomUUID().toString();

        tokenEntity.setToken(tokenValue);
        tokenEntity.setExpiresAt(now.plusHours(1));
        tokenEntity.setUsed(false);

        tokenRepository.save(tokenEntity);

        emailService.sendPasswordResetEmail(
                user.getEmail(),
                user.getName(),
                tokenValue
        );


    }

    @Override
    public void resetPassword(String tokenValue, String newPassword) {

        PasswordResetToken tokenEntity = tokenRepository.findByToken(tokenValue).orElseThrow(()->
                new BadRequestException("Invalid reset link."
                        + " Please request "
                        + "a new one."));
        if (tokenEntity.isUsed()){
            throw new BadRequestException( "This reset link has already been used."
                    + " Please request a new one.");
        }

        if (tokenEntity.getExpiresAt().isBefore(LocalDateTime.now())){
            throw new BadRequestException("This reset link has expired."
                    + " Please request a new one.");
        }
        User user =tokenEntity.getUser();
        String hashedPassword = passwordEncoder.encode(newPassword);

        user.setPassword(hashedPassword);
        userRepository.save(user);
        tokenEntity.setUsed(true);
        tokenRepository.save(tokenEntity);
    }
}
