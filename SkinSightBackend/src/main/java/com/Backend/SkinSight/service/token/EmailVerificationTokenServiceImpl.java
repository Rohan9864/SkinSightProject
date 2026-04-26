package com.Backend.SkinSight.service.token;

import com.Backend.SkinSight.entity.EmailVerificationToken;
import com.Backend.SkinSight.entity.User;
import com.Backend.SkinSight.exception.BadRequestException;
import com.Backend.SkinSight.repository.EmailVerificationTokenRepository;
import com.Backend.SkinSight.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class EmailVerificationTokenServiceImpl implements EmailVerificationTokenService{
    @Autowired
    private EmailVerificationTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public String createToken(User user) {
        tokenRepository
                .findByUserId(user.getId())
                .ifPresent(existing->{
                    tokenRepository.delete(existing);
                });

        String tokenValue = UUID.randomUUID().toString();
        EmailVerificationToken tokenEntity = EmailVerificationToken.builder()
                .user(user)
                .token(tokenValue)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .isUsed(false)
                .build();

        tokenRepository.save(tokenEntity);
        return tokenValue;
    }

    @Override
    public void verifyToken(String tokenValue) {
        EmailVerificationToken tokenEntity = tokenRepository.findByToken(tokenValue).orElseThrow(()->
                new BadRequestException( "Invalid verification link."
                        + " Please request "
                        + "a new one."));

        if (tokenEntity.isUsed()){
            throw new BadRequestException(
                    "This verification link has already "
                            + "been used. Please log in.");
        }

        if (tokenEntity.getExpiresAt()
                .isBefore(LocalDateTime.now())){
            throw new BadRequestException( "This verification link has expired."
                    + " Please request a new one.");
        }

        User user = tokenEntity.getUser();

        user.setEmailVerified(true);

        userRepository.save(user);

        tokenEntity.setUsed(true);

        tokenRepository.save(tokenEntity);

    }
}
