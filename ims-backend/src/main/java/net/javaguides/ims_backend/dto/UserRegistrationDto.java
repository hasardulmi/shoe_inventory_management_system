package net.javaguides.ims_backend.dto;

import lombok.Data;
import net.javaguides.ims_backend.entity.UserType;

@Data
public class UserRegistrationDto {
    private String username;
    private String password;
    private String email;
    private String phone;
    private String address;
    private String firstName;
    private String lastName;
    private UserType userType;
}