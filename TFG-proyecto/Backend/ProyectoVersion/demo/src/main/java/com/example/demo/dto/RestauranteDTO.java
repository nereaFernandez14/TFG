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

    private double mediaPuntuacion;

    private List<RestriccionDietetica> restricciones;

    private List<String> comentarios;
    private String rutaMenu; 
 

    // ✅ NUEVOS CAMPOS PARA DASHBOARD
    private int visitas;
    private int cantidadComentarios;

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
        this.email = restaurante.getEmail();
        this.tipoCocina = restaurante.getTipoCocina();
        this.barrio = restaurante.getBarrio();
        this.telefono = restaurante.getTelefono();
        this.rangoPrecio = restaurante.getRangoPrecio();
        this.tipoCocinaPersonalizado = restaurante.getTipoCocinaPersonalizado();
        this.mediaPuntuacion = restaurante.getMediaPuntuacion();
        this.restricciones = restaurante.getRestriccionesDieteticas();

        // Comentarios: mostramos los primeros 5
        this.comentarios = restaurante.getResenyas().stream()
                .map(Resenya::getContenido)
                .limit(5)
                .collect(Collectors.toList());

        // 👇 Datos nuevos del dashboard
        this.visitas = restaurante.getVisitas();
        this.cantidadComentarios = restaurante.getResenyas() != null ? restaurante.getResenyas().size() : 0;
        this.rutaMenu = restaurante.getRutaMenu();

    }

    public RestauranteDTO() {
        // Constructor vacío para creación/edición
    }
}