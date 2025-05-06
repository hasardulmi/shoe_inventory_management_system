package net.javaguides.ims_backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String password;
    private String role;

    @JsonProperty("first_name")
    @Column(name = "first_name")
    private String firstName;

    @JsonProperty("last_name")
    @Column(name = "last_name")
    private String lastName;

    private String address;

    @JsonProperty("phoneNumber")
    @Column(name = "phone_number")
    private String phoneNumber;

    @JsonProperty("job_title")
    @Column(name = "job_title")
    private String jobTitle;

    private Double salary;

    @JsonProperty("hire_date")
    @Column(name = "hire_date")
    private LocalDate hireDate;
}