package com.Backend.SkinSight.repository;

import com.Backend.SkinSight.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken,Long> {

    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByUserId(Long userId);

    boolean existsByUserIdAndExpiresAtAfterAndIsUsedFalse(
            Long userId,
            LocalDateTime now
    );


}
