package com.example.demo.dto;

import com.example.demo.entities.ImagenResenya;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImagenResenyaResponse {
    private Long id;
    private String nombreArchivo;
    private String tipoArchivo;

    public ImagenResenyaResponse(ImagenResenya imagen) {
        this.id = imagen.getId();
        this.nombreArchivo = imagen.getNombreArchivo();
        this.tipoArchivo = imagen.getTipo();
    }
}
