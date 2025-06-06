package com.example.demo.dto;

import lombok.Data;

@Data
public class RestauranteUpdateRequest {
    private String direccion;
    private String email;
    private String telefono;
}
