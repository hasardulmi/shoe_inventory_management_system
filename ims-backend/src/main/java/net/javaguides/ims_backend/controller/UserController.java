package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.dto.UserDTO;
import net.javaguides.ims_backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        logger.debug("Login attempt for email: {}", loginRequest.getEmail());
        try {
            UserDTO userDTO = userService.login(loginRequest.getEmail(), loginRequest.getPassword());
            logger.info("Login successful for email: {}", loginRequest.getEmail());
            Map<String, Object> response = new HashMap<>();
            response.put("user", userDTO);
            response.put("role", userDTO.getRole());
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
    public ResponseEntity<?> registerEmployee(@RequestBody UserDTO userDTO) {
        logger.debug("Register attempt for email: {}", userDTO.getEmail());
        try {
            UserDTO savedUserDTO = userService.saveUser(userDTO);
            logger.info("User registered successfully: {}", userDTO.getEmail());
            return ResponseEntity.ok(savedUserDTO);
        } catch (RuntimeException e) {
            logger.error("Registration failed for email: {}. Error: {}", userDTO.getEmail(), e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/employees")
    public ResponseEntity<List<UserDTO>> getAllEmployees() {
        logger.debug("Fetching all employees");
        List<UserDTO> employees = userService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/employee/self")
    public ResponseEntity<UserDTO> getSelfDetails(@RequestParam String email) {
        logger.debug("Fetching details for email: {}", email);
        UserDTO userDTO = userService.getCurrentUser(email);
        return ResponseEntity.ok(userDTO);
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        logger.debug("Updating user with id: {}", id);
        try {
            userDTO.setId(id);
            UserDTO existingUserDTO = userService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));

            // Preserve existing fields if not provided
            if (userDTO.getJobTitle() == null || userDTO.getJobTitle().isEmpty()) {
                userDTO.setJobTitle(existingUserDTO.getJobTitle());
            }
            if (userDTO.getRole() == null || userDTO.getRole().isEmpty()) {
                userDTO.setRole(userDTO.getJobTitle().toUpperCase());
            }
            if (userDTO.getPassword() == null || userDTO.getPassword().isEmpty()) {
                userDTO.setPassword(existingUserDTO.getPassword());
            }
            UserDTO updatedUserDTO = userService.saveUser(userDTO);
            logger.info("User updated successfully: {}", userDTO.getEmail());
            return ResponseEntity.ok(updatedUserDTO);
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