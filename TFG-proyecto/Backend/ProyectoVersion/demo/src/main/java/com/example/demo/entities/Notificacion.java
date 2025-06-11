package com.example.demo.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mensaje;
    private boolean vista;
    private boolean paraAdmin;

    // 📬 Destinatario: Restaurante (opcional)
    @ManyToOne
    private Restaurante destinatarioRestaurante;

    // 📬 Destinatario: Usuario (opcional)
    @ManyToOne
    private Usuario destinatarioUsuario;

    // 📤 Generador: Restaurante (opcional)
    @ManyToOne
    private Restaurante generadaPorRestaurante;

    // 📤 Generador: Usuario (opcional)
    @ManyToOne
    private Usuario generadaPorUsuario;
}