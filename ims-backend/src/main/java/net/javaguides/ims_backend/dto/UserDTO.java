package net.javaguides.ims_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserDTO {
    private Long id;

    @JsonProperty("first_name")
    private String firstName;

    @JsonProperty("last_name")
    private String lastName;

    private String address;

    @JsonProperty("phoneNumber")
    private String phoneNumber;

    private String email;

    @JsonProperty("job_title")
    private String jobTitle;

    private Double salary;

    @JsonProperty("hire_date")
    private LocalDate hireDate;

    private String password;
    private String role;
}