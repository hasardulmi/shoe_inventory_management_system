// src/main/java/net/javaguides/ims_backend/dto/ErrorResponse.java
package net.javaguides.ims_backend.dto;

public class ErrorResponse {
    private String message;

    public ErrorResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}