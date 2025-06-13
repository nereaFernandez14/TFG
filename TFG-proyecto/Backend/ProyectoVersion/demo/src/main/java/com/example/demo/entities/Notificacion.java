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

    private boolean vista = false;

    @ManyToOne
    private Restaurante destinatarioRestaurante;

    private boolean paraAdmin = false;

    @ManyToOne
    private Restaurante generadaPorRestaurante;

    @ManyToOne
    private Usuario destinatarioUsuario;

    @ManyToOne
    private Usuario generadaPorUsuario;
}