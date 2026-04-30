package com.Backend.SkinSight.validation;

import com.Backend.SkinSight.dto.request.RegisterRequestDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordMatchValidator implements ConstraintValidator<PasswordMatch, RegisterRequestDto> {
    @Override
    public boolean isValid(RegisterRequestDto dto, ConstraintValidatorContext context) {

        if (dto.getPassword()==null || dto.getConfirmPassword()==null){
            return true;
        }

        boolean matches =dto.getPassword().equals(dto.getConfirmPassword());

        if (!matches){
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                    "Password and confirm password "
                            + "do not match")
                    .addPropertyNode("confirmPassword")
                    .addConstraintViolation();

        }

        return matches;
    }
}
