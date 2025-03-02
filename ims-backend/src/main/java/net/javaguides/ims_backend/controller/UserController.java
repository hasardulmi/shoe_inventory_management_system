package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.dto.LoginDto;
import net.javaguides.ims_backend.dto.UserRegistrationDto;
import net.javaguides.ims_backend.entity.User;
import net.javaguides.ims_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginDto loginDto) {
        // Authenticate the user
        User user = userService.authenticate(loginDto.getUsername(), loginDto.getPassword());

        if (user != null) {
            // Return a JSON object with userType and other details
            Map<String, String> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("userType", user.getUserType().toString()); // Convert UserType enum to String
            response.put("username", user.getUsername()); // Optional: Include additional user details
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }


    @PostMapping("/register")
    public String registerUser(@RequestBody UserRegistrationDto registrationDto) {
        return userService.registerUser(registrationDto);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/{id}")
    public String updateUser(@PathVariable Long id, @RequestBody UserRegistrationDto registrationDto) {
        return userService.updateUser(id, registrationDto);
    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        return userService.deleteUser(id);
    }
}