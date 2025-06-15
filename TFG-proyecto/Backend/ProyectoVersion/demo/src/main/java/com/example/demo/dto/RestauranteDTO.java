package com.example.demo.dto;

import com.example.demo.entities.ImagenRestaurante;
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
    private String email;

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

    @NotNull(message = "El teléfono es obligatorio.")
    private String telefono;

    private String tipoCocinaPersonalizado;
    private String descripcion;

    private double mediaPuntuacion;
    private List<RestriccionDietetica> restricciones;
    private List<String> comentarios;

    private String rutaMenu;

    private int visitas;
    private int cantidadComentarios;

    // ✅ NUEVO: imágenes en base a BLOB
    private List<ImagenRestauranteResponse> imagenes;

    public RestauranteDTO() {
    }

    public RestauranteDTO(Restaurante restaurante) {
        this.id = restaurante.getId();
        this.nombre = restaurante.getNombre();
        this.direccion = restaurante.getDireccion();
        this.email = restaurante.getEmail();
        this.tipoCocina = restaurante.getTipoCocina();
        this.barrio = restaurante.getBarrio();
        this.telefono = restaurante.getTelefono();
        this.rangoPrecio = restaurante.getRangoPrecio();
        this.tipoCocinaPersonalizado = restaurante.getTipoCocinaPersonalizado();
        this.descripcion = restaurante.getDescripcion();
        this.mediaPuntuacion = restaurante.getMediaPuntuacion();
        this.restricciones = restaurante.getRestriccionesDieteticas();
        this.rutaMenu = restaurante.getRutaMenu();

        this.comentarios = restaurante.getResenyas().stream()
                .map(Resenya::getContenido)
                .limit(5)
                .collect(Collectors.toList());

        this.visitas = restaurante.getVisitas();
        this.cantidadComentarios = restaurante.getResenyas() != null
                ? restaurante.getResenyas().size()
                : 0;
    }

    // ✅ Constructor extendido que incluye imágenes
    public RestauranteDTO(Restaurante restaurante, List<ImagenRestaurante> imagenes) {
        this(restaurante); // llama al constructor anterior

        this.imagenes = imagenes.stream()
                .map(ImagenRestauranteResponse::new)
                .collect(Collectors.toList());
    }

    public String getTipoCocinaFinal() {
        if (tipoCocina == TipoCocina.OTRO && tipoCocinaPersonalizado != null && !tipoCocinaPersonalizado.isBlank()) {
            return tipoCocinaPersonalizado;
        }
        return tipoCocina.name();
    }
}