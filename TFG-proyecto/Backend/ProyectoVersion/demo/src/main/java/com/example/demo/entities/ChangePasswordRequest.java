package com.example.demo.entities;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
@Data
public class ChangePasswordRequest {
    private String currentPassword;
    private String newPassword;
}
