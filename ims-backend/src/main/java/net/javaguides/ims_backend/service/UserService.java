// src/main/java/net/javaguides/ims_backend/service/UserService.java
package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.entity.User;
import net.javaguides.ims_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        throw new RuntimeException("Invalid credentials");
    }

    public User saveUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public List<User> getAllEmployees() {
        return userRepository.findAll().stream()
                .filter(user -> "EMPLOYEE".equals(user.getRole()))
                .toList();
    }

    public void deleteEmployee(Long id) {
        userRepository.deleteById(id);
    }
}