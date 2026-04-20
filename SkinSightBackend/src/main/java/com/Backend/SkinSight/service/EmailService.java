package com.Backend.SkinSight.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Component;

@Component
public class EmailService {
    @Autowired
    private MailSender mailSender;
    public void sendPasswordResetEmail(String toEmail,
                                       String name,
                                       String token){
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject("Reset your password — Skin Sight");
        message.setText(
                "Hello " + name + ",\n\n"
                        + "We received a request to reset your "
                        + "account password.\n\n"
                        + "Click the link below to set a new password:\n\n"
                        + "http://localhost:8080/api/auth/reset-password"
                        + "?token=" + token + "\n\n"
                        + "This link expires in 1 hour.\n\n"
                        + "If you did not request a password reset, "
                        + "please ignore this email. Your password "
                        + "will remain unchanged.\n\n"
                        + "Regards,\nSkinSight :Skin Disease Screening and Clinical Review System "
        );

        mailSender.send(message);
    }
}
