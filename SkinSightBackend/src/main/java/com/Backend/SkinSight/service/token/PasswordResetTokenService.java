package com.Backend.SkinSight.service.token;

public interface PasswordResetTokenService {

    void createTokenAndSendMail(String email);

    void resetPassword(String token,String newPassword);
}
