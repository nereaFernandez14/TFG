package com.example.demo.entities;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.Data;

@Entity
@Data
public class Restaurante {
  
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String nombre;
    private String direccion;
    private String telefono;
    private String email;
    private String password;
    @OneToOne
    private Usuario usuario;    //Usuario que representa al restaurante
    @OneToMany(mappedBy = "restaurante", cascade = CascadeType.ALL)
    private List<Resenya> resenyas;

    public Restaurante() {
    }
    public Restaurante(String nombre, String direccion, String telefono, String email, String password) {
        this.nombre = nombre;
        this.direccion = direccion;
        this.telefono = telefono;
        this.email = email;
        this.password = password;
        this.resenyas= new ArrayList<>();
    }
}
