// src/main/java/net/javaguides/ims_backend/repository/UserRepository.java
package net.javaguides.ims_backend.repository;

import net.javaguides.ims_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}