package com.example.demo.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class SolicitudModificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String campo;
    private String nuevoValor;

    @ManyToOne
    private Restaurante restaurante;

    private boolean gestionada = false;
}
