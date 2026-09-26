package com.Backend.SkinSight.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.base.url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public void sendVerificationEmail(String toEmail,
                                      String name,
                                      String token){
        String verificationLink =baseUrl+"/api/auth/verify?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject("Verify your email — SkinSight");
        message.setText(
                "Hello " + name + ",\n\n"
                        + "Thank you for registering on SkinSight.\n\n"
                        + "Please click the link below to verify "
                        + "your email address:\n\n"
                        + verificationLink + "\n\n"
                        + "This link expires in 24 hours.\n\n"
                        + "If you did not create an account, "
                        + "please ignore this email.\n\n"
                        + "Regards,\n"
                        + "SkinSight Team"
        );

        mailSender.send(message);
    }

    public void sendDoctorCredentials(String toEmail,
                                      String name,
                                      String tempPassword){
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject("Your doctor account has been created — SkinSight");
        message.setText(
                "Hello Dr. " + name + ",\n\n"
                        + "Your account has been created on SkinSight "
                        + "by the system administrator.\n\n"
                        + "Your login credentials:\n"
                        + "─────────────────────────\n"
                        + "Email:    " + toEmail + "\n"
                        + "Password: " + tempPassword + "\n"
                        + "─────────────────────────\n\n"
                        + "Please log in and change your password "
                        + "immediately after your first login.\n\n"
                        + "Login at: " + frontendUrl + "\n\n"
                        + "If you believe you received this email "
                        + "by mistake, please contact the administrator.\n\n"
                        + "Regards,\n"
                        + "SkinSight Team"
        );
        mailSender.send(message);

    }

    public void sendPasswordResetEmail(String toEmail,
                                       String name,
                                       String token){
        String resetLink =
                frontendUrl + "/reset-password?token=" + token;


        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject("Reset your password — SkinSight");
        message.setText(
                "Hello " + name + ",\n\n"
                        + "We received a request to reset the "
                        + "password for your SkinSight account.\n\n"
                        + "Click the link below to set "
                        + "a new password:\n\n"
                        + resetLink + "\n\n"
                        + "This link expires in 1 hour.\n\n"
                        + "If you did not request a password reset, "
                        + "please ignore this email. "
                        + "Your password will remain unchanged.\n\n"
                        + "Regards,\n"
                        + "SkinSight Team"
        );

        mailSender.send(message);
    }

    public void sendCaseAssignmentEmail(String toEmail,
                                        String name,
                                        Long caseId){
        String loginLink = frontendUrl + "/doctor";

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject("New case assigned to you — SkinSight");
        message.setText(
                "Hello Dr. " + name + ",\n\n"
                        + "A new case has been assigned to you in SkinSight. "
                        + "Please review Case #" + caseId + " as soon as possible.\n\n"
                        + "Log in to your doctor dashboard to view the case.\n\n"
                        + "Thank you for your prompt attention.\n\n"
                        + "Regards,\n"
                        + "SkinSight Team"
        );

        mailSender.send(message);
    }

    public void sendResultReadyEmail(String toEmail,
                                     String name,
                                     Long caseId){
        String resultLink = frontendUrl
                + "/api/cases/" + caseId;

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject( "Your diagnosis result is ready — SkinSight");
        message.setText(
                "Hello " + name + ",\n\n"
                        + "Your skin disease diagnosis result "
                        + "for Case #" + caseId + " has been "
                        + "reviewed by a doctor and is now "
                        + "available for you to view.\n\n"
                        + "You can view result by logging in to skinsight"
                        + "You can also download a PDF report "
                        + "of your diagnosis from the same page.\n\n"
                        + "Please note: This result is for "
                        + "informational purposes only and does "
                        + "not replace professional medical advice.\n\n"
                        + "Regards,\n"
                        + "SkinSight Team"
        );

        mailSender.send(message);

    }

    public void sendResubmissionEmail(String toEmail,
                                      String name,
                                      Long caseId,
                                      String doctorNote){

        String uploadLink=frontendUrl + "/api/cases";

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject("Action required: Please resubmit "
                + "your image — SkinSight");
        message.setText( "Hello " + name + ",\n\n"
                + "The doctor who reviewed your Case #"
                + caseId + " has requested that you "
                + "submit a new image.\n\n"
                + "Doctor's note:\n"
                + "─────────────────────────\n"
                + doctorNote + "\n"
                + "─────────────────────────\n\n"
                + "Please submit a new image via skinsight\n\n"
                + "Tips for a good image:\n"
                + "- Ensure good lighting\n"
                + "- Keep the camera steady\n"
                + "- Focus clearly on the affected area\n"
                + "- Avoid shadows or obstructions\n\n"
                + "Regards,\n"
                + "SkinSight Team"
        );
        mailSender.send(message);
    }
}
