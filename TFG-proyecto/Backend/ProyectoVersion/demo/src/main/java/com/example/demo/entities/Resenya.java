package com.example.demo.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"autor_id", "restaurante_id"}))
@Data
public class Resenya{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String contenido;

    @NotNull(message = "La valoración es obligatoria.")
    @Min(value = 1, message = "La valoración mínima es 1.")
    @Max(value = 5, message = "La valoración máxima es 5.")
    private Integer valoracion;

    @ManyToOne
    @NotNull(message = "El autor es obligatorio.")
    private Usuario autor;

    @ManyToOne
    @NotNull(message = "El restaurante es obligatorio.")
    private Restaurante restaurante;

    public Resenya(String contenido,
            @NotNull(message = "La valoración es obligatoria.") @Min(value = 1, message = "La valoración mínima es 1.") @Max(value = 5, message = "La valoración máxima es 5.") Integer valoracion,
            @NotNull(message = "El autor es obligatorio.") Usuario autor,
            @NotNull(message = "El restaurante es obligatorio.") Restaurante restaurante) {
        this.contenido = contenido;
        this.valoracion = valoracion;
        this.autor = autor;
        this.restaurante = restaurante;
    }

    public Resenya() {
    }
}
