package com.example.demo.dto;

import com.example.demo.entities.Resenya;
import com.example.demo.entities.Restaurante;
import com.example.demo.enums.Barrio;
import com.example.demo.enums.RangoPrecio;
import com.example.demo.enums.RestriccionDietetica;
import com.example.demo.enums.TipoCocina;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
public class RestauranteDTO {

    private Long id;

    @NotBlank(message = "El nombre es obligatorio.")
    private String nombre;

    @NotBlank(message = "La dirección es obligatoria.")
    private String direccion;

    @NotNull(message = "El tipo de cocina es obligatorio.")
    private TipoCocina tipoCocina;

    @NotNull(message = "El barrio es obligatorio.")
    private Barrio barrio;

    @NotNull(message = "El rango de precio es obligatorio.")
    private RangoPrecio rangoPrecio;

    private String tipoCocinaPersonalizado;

    private double mediaPuntuacion;

    private List<RestriccionDietetica> restricciones;

    private List<String> comentarios;

    // 🔄 Para mostrar "ITALIANA" o "Peruana (otro)"
    public String getTipoCocinaFinal() {
        if (tipoCocina == TipoCocina.OTRO && tipoCocinaPersonalizado != null && !tipoCocinaPersonalizado.isBlank()) {
            return tipoCocinaPersonalizado;
        }
        return tipoCocina.name();
    }

    public RestauranteDTO(Restaurante restaurante) {
        this.id = restaurante.getId();
        this.nombre = restaurante.getNombre();
        this.direccion = restaurante.getDireccion();
        this.tipoCocina = restaurante.getTipoCocina();
        this.barrio = restaurante.getBarrio();
        this.rangoPrecio = restaurante.getRangoPrecio();
        this.tipoCocinaPersonalizado = restaurante.getTipoCocinaPersonalizado();
        this.mediaPuntuacion = restaurante.getMediaPuntuacion();
        this.restricciones = restaurante.getRestriccionesDieteticas();

        this.comentarios = restaurante.getResenyas().stream()
                .map(Resenya::getContenido)
                .limit(5)
                .collect(Collectors.toList());
    }

    public RestauranteDTO() {
        // Constructor vacío para creación/edición
    }
}