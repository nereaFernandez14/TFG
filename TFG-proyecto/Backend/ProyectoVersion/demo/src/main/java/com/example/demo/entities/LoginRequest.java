package com.example.demo.entities;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "El usuario es obligatorio")
    private String username;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;

    public LoginRequest() {
    }

    public LoginRequest(@NotBlank(message = "El usuario es obligatorio") String username,
            @NotBlank(message = "La contraseña es obligatoria") String password) {
        this.username = username;
        this.password = password;
    }

}
