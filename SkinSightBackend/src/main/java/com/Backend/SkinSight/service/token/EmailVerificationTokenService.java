package com.Backend.SkinSight.service.token;

import com.Backend.SkinSight.entity.User;

public interface EmailVerificationTokenService {
    String createToken(User user);

    void verifyToken(String token);
}
