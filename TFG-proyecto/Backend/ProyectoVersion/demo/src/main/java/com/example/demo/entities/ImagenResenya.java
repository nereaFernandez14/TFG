package com.example.demo.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class ImagenResenya {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombreArchivo;

    private String tipo;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] datos;

    @ManyToOne
    @JsonBackReference
    private Resenya resenya;

}