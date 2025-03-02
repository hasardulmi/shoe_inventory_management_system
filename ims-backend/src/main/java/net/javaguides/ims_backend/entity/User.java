package net.javaguides.ims_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import static net.javaguides.ims_backend.entity.UserType.EMPLOYEE;
import static net.javaguides.ims_backend.entity.UserType.OWNER;


@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private String email;
    private String phone;
    private String address;
    private String firstName;
    private String lastName;


    @Enumerated(EnumType.STRING)
    private UserType userType;

    public UserType getUserType() {
        return userType;
    }

    public void setUserType(UserType userType) {
        this.userType = userType;
    }
}

