package com.example.demo.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

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

    private boolean gestionada;

    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "destinatario_restaurante_id")
    private Restaurante destinatarioRestaurante;

    @ManyToOne
    @JoinColumn(name = "destinatario_usuario_id")
    private Usuario destinatarioUsuario;

    @ManyToOne
    @JoinColumn(name = "generada_por_restaurante_id")
    private Restaurante generadaPorRestaurante;

    @ManyToOne
    @JoinColumn(name = "generada_por_usuario_id")
    private Usuario generadaPorUsuario;
}