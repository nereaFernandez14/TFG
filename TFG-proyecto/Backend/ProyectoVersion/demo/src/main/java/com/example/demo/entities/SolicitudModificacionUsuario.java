package com.example.demo.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Data
public class SolicitudModificacionUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String campo;
    private String nuevoValor;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    private boolean gestionada = false;
    private Boolean aceptada;

}
