// src/main/java/net/javaguides/ims_backend/entity/User.java
package net.javaguides.ims_backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String password;
    private String role; // "OWNER" or "EMPLOYEE"

    private String firstName;
    private String lastName;
    private String address;
    private String phoneNumber;
    private String jobTitle;
    private Double salary;
    private String hireDate;
}