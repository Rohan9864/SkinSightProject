package com.Backend.SkinSight.service.user;

import com.Backend.SkinSight.dto.request.UpdateUserRequestDto;
import com.Backend.SkinSight.dto.response.UserResponseDto;
import com.Backend.SkinSight.entity.User;
import com.Backend.SkinSight.enums.Role;
import com.Backend.SkinSight.mapper.UserMapper;
import com.Backend.SkinSight.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;

public class UserServiceImpl implements UserService{
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;
    @Override
    public List<UserResponseDto> getAllDoctors() {
        List<User> doctors = userRepository.findByRole(Role.DOCTOR);

        return doctors.stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDto> getAllPatients() {
        List<User> patients = userRepository.findByRole(Role.PATIENT);
        return patients.stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDto getUserById(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(()->
                new RuntimeException("User not found with id: "+ userId));
        return userMapper.toDto(user);
    }

    @Override
    public void toggleAccountStatus(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(()->
                new RuntimeException("User not found with id: "+userId));

        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    @Override
    public UserResponseDto getMyProfile(Long userId) {
        User user= userRepository.findById(userId).orElseThrow(()->
                new RuntimeException("User not found with id: "+userId));
        return null;
    }

    @Override
    public UserResponseDto updateMyProfile(Long userId, UpdateUserRequestDto dto) {
        User user= userRepository.findById(userId).orElseThrow(()->
                new RuntimeException("User not found with id: "+userId));

        if (dto.getName()!=null && !dto.getName().isBlank()){
            user.setName(dto.getName());
        }

        if (dto.getProfileImageUrl()!=null){
            user.setProfileImageUrl(dto.getProfileImageUrl());
        }

        userRepository.save(user);

        return userMapper.toDto(user);
    }
}
