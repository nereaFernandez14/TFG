package com.example.demo.entities;

import java.util.Optional;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Data
@NoArgsConstructor // Constructor vacío generado automáticamente
@AllArgsConstructor // Constructor con todos los campos
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellidos;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @ToString.Exclude // Evita que aparezca en toString (por seguridad)
    @EqualsAndHashCode.Exclude // No usar password en equals/hashCode
    private String password;

    @ManyToOne
    @JoinColumn(name = "rol_id", nullable = false)
    @NotNull(message = "El rol es obligatorio para el usuario")
    private Rol rol;
    @Column(name = "esta_registrado")
    private boolean estaRegistrado = false;

    public boolean isEstaRegistrado() {
        return estaRegistrado;
    }

    public void setEstaRegistrado(boolean estaRegistrado) {
        this.estaRegistrado = estaRegistrado;
    }
}
