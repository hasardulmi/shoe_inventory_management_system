package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.entity.User;
import net.javaguides.ims_backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        logger.debug("Login attempt for email: {}", loginRequest.getEmail());
        try {
            User user = userService.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                logger.warn("Invalid password for email: {}", loginRequest.getEmail());
                throw new RuntimeException("Invalid password");
            }
            logger.info("Login successful for email: {}", loginRequest.getEmail());
            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("role", user.getRole());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Login failed for email: {}. Error: {}", loginRequest.getEmail(), e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        } catch (Exception e) {
            logger.error("Unexpected error during login for email: {}", loginRequest.getEmail(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/register-employee")
    public ResponseEntity<?> registerEmployee(@RequestBody User user) {
        logger.debug("Register attempt for email: {}", user.getEmail());
        try {
            if (user.getJobTitle() == null || user.getJobTitle().isEmpty()) {
                user.setJobTitle("Employee");
            }
            if (user.getRole() == null || user.getRole().isEmpty()) {
                user.setRole(user.getJobTitle().toUpperCase());
            }
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                throw new RuntimeException("Password is required");
            }
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            User savedUser = userService.saveUser(user);
            logger.info("User registered successfully: {}", user.getEmail());
            return ResponseEntity.ok(savedUser);
        } catch (RuntimeException e) {
            logger.error("Registration failed for email: {}. Error: {}", user.getEmail(), e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/employees")
    public ResponseEntity<List<User>> getAllEmployees() {
        logger.debug("Fetching all employees");
        List<User> employees = userService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/employee/self")
    public ResponseEntity<User> getSelfDetails(@RequestParam String email) {
        logger.debug("Fetching details for email: {}", email);
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody User user) {
        logger.debug("Updating user with id: {}", id);
        try {
            user.setId(id);
            if (user.getJobTitle() == null || user.getJobTitle().isEmpty()) {
                User existingUser = userService.findById(id)
                        .orElseThrow(() -> new RuntimeException("Employee not found"));
                user.setJobTitle(existingUser.getJobTitle());
            }
            if (user.getRole() == null || user.getRole().isEmpty()) {
                user.setRole(user.getJobTitle().toUpperCase());
            }
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            } else {
                User existingUser = userService.findById(id)
                        .orElseThrow(() -> new RuntimeException("Employee not found"));
                user.setPassword(existingUser.getPassword());
            }
            User updatedUser = userService.saveUser(user);
            logger.info("User updated successfully: {}", user.getEmail());
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            logger.error("Update failed for id: {}. Error: {}", id, e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        logger.debug("Deleting user with id: {}", id);
        try {
            userService.deleteEmployee(id);
            logger.info("User deleted successfully: {}", id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            logger.error("Deletion failed for id: {}. Error: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}

class LoginRequest {
    private String email;
    private String password;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}