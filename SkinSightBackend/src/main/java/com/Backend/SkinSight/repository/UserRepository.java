package com.Backend.SkinSight.repository;

import com.Backend.SkinSight.entity.User;
import com.Backend.SkinSight.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findBYEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByRoleAndIsActive(Role role,boolean isActive);

}
