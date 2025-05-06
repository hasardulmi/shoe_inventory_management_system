package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.entity.User;
import net.javaguides.ims_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User saveUser(User user) {
        if (user.getId() == null || !userRepository.findById(user.getId())
                .map(User::getEmail).equals(Optional.of(user.getEmail()))) {
            if (userRepository.existsByEmail(user.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
        }
        return userRepository.save(user);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAllEmployees() {
        return userRepository.findAll().stream()
                .filter(user -> user.getJobTitle() != null &&
                        user.getJobTitle().toLowerCase().equals("employee"))
                .collect(Collectors.toList());
    }

    public void deleteEmployee(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Employee not found");
        }
        userRepository.deleteById(id);
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}