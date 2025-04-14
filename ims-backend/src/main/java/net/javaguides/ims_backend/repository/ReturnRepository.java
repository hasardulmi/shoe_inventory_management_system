// src/main/java/net/javaguides/ims_backend/repository/ReturnRepository.java
package net.javaguides.ims_backend.repository;

import net.javaguides.ims_backend.entity.Return;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReturnRepository extends JpaRepository<Return, Long> {
}