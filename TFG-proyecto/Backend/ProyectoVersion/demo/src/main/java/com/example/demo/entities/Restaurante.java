package com.example.demo.entities;

import com.example.demo.enums.Barrio;
import com.example.demo.enums.RangoPrecio;
import com.example.demo.enums.RestriccionDietetica;
import com.example.demo.enums.TipoCocina;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Restaurante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String nombre;
    @Column(name = "ruta_menu")
    private String rutaMenu;


    private String direccion;
    private String telefono;
    private String email;
    private String password;

    @Column
    private String tipoCocinaPersonalizado;

    @OneToOne
    private Usuario usuario;

    @OneToMany(mappedBy = "restaurante", cascade = CascadeType.ALL)
    @JsonManagedReference("restaurante-resenyas")
    private List<Resenya> resenyas = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCocina tipoCocina;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Barrio barrio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RangoPrecio rangoPrecio;
    @Column(nullable = false)
    private boolean solicitaBaja = false;
    @ElementCollection
    @CollectionTable(name = "restaurante_imagenes", joinColumns = @JoinColumn(name = "restaurante_id"))
    @Column(name = "nombre_imagen")
    private List<String> imagenes = new ArrayList<>();



    @ElementCollection(targetClass = RestriccionDietetica.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "restaurante_restricciones", joinColumns = @JoinColumn(name = "restaurante_id"))
    @Column(name = "restriccion")
    private List<RestriccionDietetica> restriccionesDieteticas = new ArrayList<>();

    // ✅ NUEVO: visitas
    @Column(nullable = false)
    private int visitas = 0;

    public Restaurante() {
    }

    public Restaurante(String nombre, String direccion, String telefono, String email,
            TipoCocina tipoCocina, Barrio barrio, RangoPrecio rangoPrecio) {
        this.nombre = nombre;
        this.direccion = direccion;
        this.telefono = telefono;
        this.email = email;
        this.tipoCocina = tipoCocina;
        this.barrio = barrio;
        this.rangoPrecio = rangoPrecio;
        this.resenyas = new ArrayList<>();
    }

    public double getMediaPuntuacion() {
        if (resenyas == null || resenyas.isEmpty()) {
            return 0.0;
        }
        return resenyas.stream()
                .mapToInt(Resenya::getValoracion)
                .average()
                .orElse(0.0);
    }

    public int getVisitas() {
        return visitas;
    }

    public void setVisitas(int visitas) {
        this.visitas = visitas;
    }

    public void incrementarVisitas() {
        this.visitas++;
    }
}