package com.fsad.backend.repository;

import com.fsad.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByUniqueId(String uniqueId);

    long countByRole(com.fsad.backend.entity.Role role);
}
