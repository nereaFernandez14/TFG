package com.example.demo.entities;

import com.example.demo.enums.RestriccionDietetica;
import com.example.demo.enums.RolNombre;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;
import java.util.stream.Collectors;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
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
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private String password;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "El rol es obligatorio para el usuario")
    private RolNombre rol;

    @Column(name = "esta_registrado")
    private boolean estaRegistrado = false;
    @Column(nullable = false)
    private boolean solicitaBaja = false;
    
    @ElementCollection(targetClass = RestriccionDietetica.class)
    @CollectionTable(
        name = "usuario_restricciones",
        joinColumns = @JoinColumn(name = "usuario_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "restriccion")
    private Set<RestriccionDietetica> restriccionesDieteticas = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "favoritos",
        joinColumns = @JoinColumn(name = "usuario_id"),
        inverseJoinColumns = @JoinColumn(name = "restaurante_id")
    )
    private Set<Restaurante> favoritos = new HashSet<>();



    public boolean isEstaRegistrado() {
        return estaRegistrado;
    }

    public void setEstaRegistrado(boolean estaRegistrado) {
        this.estaRegistrado = estaRegistrado;
    }
}