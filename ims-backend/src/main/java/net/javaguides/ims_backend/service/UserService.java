package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.dto.UserDTO;
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

    public UserDTO saveUser(UserDTO userDTO) {
        // Convert DTO to Entity
        User user = convertToEntity(userDTO);

        // Check for email uniqueness unless it's the same user (for updates)
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent() && (user.getId() == null || !existingUser.get().getId().equals(user.getId()))) {
            throw new RuntimeException("Email already exists");
        }

        // Encode password if provided
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        // Set default job title and role if not provided
        if (user.getJobTitle() == null || user.getJobTitle().isEmpty()) {
            user.setJobTitle("Employee");
        }
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole(user.getJobTitle().toUpperCase());
        }

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    public Optional<UserDTO> findById(Long id) {
        return userRepository.findById(id).map(this::convertToDTO);
    }

    public Optional<UserDTO> findByEmail(String email) {
        return userRepository.findByEmail(email).map(this::convertToDTO);
    }

    public List<UserDTO> getAllEmployees() {
        return userRepository.findAll().stream()
                .filter(user -> user.getJobTitle() != null )
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteEmployee(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Employee not found");
        }
        userRepository.deleteById(id);
    }

    public UserDTO getCurrentUser(String email) {
        return convertToDTO(userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found")));
    }

    public UserDTO login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        return convertToDTO(user);
    }

    // Helper method to convert User to UserDTO
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setAddress(user.getAddress());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setEmail(user.getEmail());
        dto.setJobTitle(user.getJobTitle());
        dto.setSalary(user.getSalary());
        dto.setHireDate(user.getHireDate());
        dto.setPassword(user.getPassword()); // Note: Typically, password should not be returned
        dto.setRole(user.getRole());
        return dto;
    }

    // Helper method to convert UserDTO to User
    private User convertToEntity(UserDTO dto) {
        User user = new User();
        user.setId(dto.getId());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setAddress(dto.getAddress());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setEmail(dto.getEmail());
        user.setJobTitle(dto.getJobTitle());
        user.setSalary(dto.getSalary());
        user.setHireDate(dto.getHireDate());
        user.setPassword(dto.getPassword()); // Password will be encoded in saveUser if needed
        user.setRole(dto.getRole());
        return user;
    }
}