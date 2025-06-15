package com.example.demo.dto;

import com.example.demo.entities.ImagenRestaurante;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImagenRestauranteResponse {
    private Long id;
    private String nombreArchivo;
    private String tipoArchivo;

    public ImagenRestauranteResponse(ImagenRestaurante imagen) {
        this.id = imagen.getId();
        this.nombreArchivo = imagen.getNombreArchivo();
        this.tipoArchivo = imagen.getTipo();
    }
}