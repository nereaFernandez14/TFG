package com.example.demo.entities;

import java.util.ArrayList;
import java.util.Collection;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Data;

@Entity
@Data
public class Rol {

    public static final Rol UNKNOWN = null;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String nombre;

    @OneToMany(mappedBy = "rol") // Relación de uno a muchos (un rol tiene muchos usuarios)
    private Collection<Usuario> usuarios;

    public Rol(String nombre) {
        this.nombre = nombre;
        this.usuarios = new ArrayList<>();
    }

    public Rol() {
        this.usuarios = new ArrayList<>();
    }
}
