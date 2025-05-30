package com.example.demo.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Mensaje {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String contenidoMensaje;

    public Mensaje(String contenidoMensaje) {
        this.contenidoMensaje = contenidoMensaje;
    }

    public Mensaje() {
    }
}
