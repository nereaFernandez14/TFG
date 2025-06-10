package com.example.demo.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mensaje;

    private boolean vista = false;

    // ✅ Si es para un restaurante concreto
    @ManyToOne
    private Restaurante destinatarioRestaurante;

    // ✅ Si es para el administrador
    private boolean paraAdmin = false;

    // ✅ (Opcional) Quién generó la notificación, solo si te interesa trazar origen
    @ManyToOne
    private Restaurante generadaPorRestaurante;
}
