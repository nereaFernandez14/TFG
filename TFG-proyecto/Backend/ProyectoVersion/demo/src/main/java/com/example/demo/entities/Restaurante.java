package com.example.demo.entities;

import com.example.demo.enums.Barrio;
import com.example.demo.enums.RangoPrecio;
import com.example.demo.enums.RestriccionDietetica;
import com.example.demo.enums.TipoCocina;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Restaurante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
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
    @JoinColumn(name = "usuario_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private Usuario usuario;

    @OneToMany(mappedBy = "restaurante", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("restaurante-resenyas")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
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

    @Column(nullable = false)
    private int visitas = 0;

    @OneToMany(mappedBy = "restaurante", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<SolicitudModificacion> solicitudesModificacion = new ArrayList<>();

    @OneToMany(mappedBy = "destinatarioRestaurante", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Notificacion> notificacionesRecibidas = new ArrayList<>();

    @OneToMany(mappedBy = "generadaPorRestaurante", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Notificacion> notificacionesGeneradas = new ArrayList<>();

    public double getMediaPuntuacion() {
        if (resenyas == null || resenyas.isEmpty()) {
            return 0.0;
        }
        return resenyas.stream()
                .mapToInt(Resenya::getValoracion)
                .average()
                .orElse(0.0);
    }

    public void incrementarVisitas() {
        this.visitas++;
    }
}
