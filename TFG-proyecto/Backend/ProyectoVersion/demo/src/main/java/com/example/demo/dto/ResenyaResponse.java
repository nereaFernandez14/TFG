package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class ResenyaResponse {
    private Long id;
    private String contenido;
    private Integer valoracion;
    private String autorEmail;
    private List<ImagenResenyaResponse> imagenes;
}
