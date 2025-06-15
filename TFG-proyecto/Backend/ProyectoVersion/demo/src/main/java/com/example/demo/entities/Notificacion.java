package com.example.demo.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones")
@Getter
@Setter
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String mensaje;

    @Column(nullable = false)
    private boolean vista;

    @Column(nullable = false)
    private boolean paraAdmin;

    @Column(nullable = false)
    private boolean gestionada;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "destinatario_restaurante_id", nullable = true)
    private Restaurante destinatarioRestaurante;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "destinatario_usuario_id", nullable = true)
    private Usuario destinatarioUsuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario generadaPorUsuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurante_id")
    private Restaurante generadaPorRestaurante;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        validarDestinatario();
    }

    @PreUpdate
    protected void onUpdate() {
        validarDestinatario();
    }

    private void validarDestinatario() {
        if (destinatarioUsuario == null && destinatarioRestaurante == null) {
            throw new IllegalStateException(
                    "La notificación debe tener al menos un destinatario (usuario o restaurante).");
        }
    }
}