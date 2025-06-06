package com.example.demo.entities;

import java.time.LocalDateTime;

import com.example.demo.enums.TipoPeticion;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PeticionAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long restauranteId;
    private String nombreRestaurante;

    @Enumerated(EnumType.STRING)
    private TipoPeticion tipo; // DENUNCIA, MODIFICACION, BAJA

    private Long idResenya; // solo si es tipo DENUNCIA
    private String descripcion; // opcional
    @Column
    private boolean revisada;

    private boolean aprobada; // true si fue aceptada

    private LocalDateTime fecha = LocalDateTime.now();
}
