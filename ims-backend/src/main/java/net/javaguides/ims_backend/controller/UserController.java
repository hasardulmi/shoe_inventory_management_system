// src/main/java/net/javaguides/ims_backend/controller/UserController.java
package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.entity.User;
import net.javaguides.ims_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody User user) {
        User loggedInUser = userService.login(user.getEmail(), user.getPassword());
        return ResponseEntity.ok(loggedInUser);
    }

    @PostMapping("/register-employee")
    public ResponseEntity<User> registerEmployee(@RequestBody User user) {
        user.setRole("EMPLOYEE");
        User savedUser = userService.saveUser(user);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping("/employees")
    public ResponseEntity<List<User>> getAllEmployees() {
        return ResponseEntity.ok(userService.getAllEmployees());
    }

    @PutMapping("/employees/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<User> updateEmployee(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        User updatedUser = userService.saveUser(user);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        userService.deleteEmployee(id);
        return ResponseEntity.ok().build();
    }
}