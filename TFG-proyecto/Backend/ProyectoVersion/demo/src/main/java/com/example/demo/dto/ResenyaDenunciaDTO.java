package com.example.demo.dto;

import com.example.demo.entities.Resenya;

import lombok.Data;

@Data
public class ResenyaDenunciaDTO {
    private Long id;
    private String contenido;
    private String restauranteNombre;

    public ResenyaDenunciaDTO(Resenya r) {
        this.id = r.getId();
        this.contenido = r.getContenido();
        this.restauranteNombre = r.getRestaurante() != null ? r.getRestaurante().getNombre() : "Desconocido";
    }

    // Getters y Setters
}
