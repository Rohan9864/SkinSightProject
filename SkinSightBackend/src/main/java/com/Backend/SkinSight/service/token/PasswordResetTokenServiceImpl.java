package com.Backend.SkinSight.service.token;

import com.Backend.SkinSight.entity.PasswordResetToken;
import com.Backend.SkinSight.entity.User;
import com.Backend.SkinSight.repository.PasswordResetTokenRepository;
import com.Backend.SkinSight.repository.UserRepository;
import com.Backend.SkinSight.service.EmailService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

        User user=userRepository.findBYEmail(email).orElseThrow(()->
                new RuntimeException("No account found with "
                        + "email: " + email));
        tokenRepository.findByUserId(user.getId()).ifPresent(existing->{
            tokenRepository.delete(existing);
        });

        String tokenValue = UUID.randomUUID().toString();
        PasswordResetToken tokenEntity = PasswordResetToken.builder()
                .user(user)
                .token(tokenValue)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .isUsed(false)
                .build();

        tokenRepository.save(tokenEntity);
        emailService.sendPasswordResetEmail(
                user.getEmail(),
                user.getName(),
                tokenValue);

    }

    @Override
    public void resetPassword(String tokenValue, String newPassword) {

        PasswordResetToken tokenEntity = tokenRepository.findByToken(tokenValue).orElseThrow(()->
                new RuntimeException("Invalid reset link."
                        + " Please request "
                        + "a new one."));
        if (tokenEntity.isUsed()){
            throw new RuntimeException( "This reset link has already been used."
                    + " Please request a new one.");
        }

        if (tokenEntity.getExpiresAt().isBefore(LocalDateTime.now())){
            throw new RuntimeException("This reset link has expired."
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
