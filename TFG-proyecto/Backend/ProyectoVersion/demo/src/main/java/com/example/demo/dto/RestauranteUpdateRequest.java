package com.example.demo.dto;

import com.example.demo.enums.Barrio;
import com.example.demo.enums.RestriccionDietetica;
import com.example.demo.enums.TipoCocina;
import lombok.Data;

import java.util.List;
import com.example.demo.enums.RangoPrecio;

@Data
public class RestauranteUpdateRequest {
    private String nombre;
    private String direccion;
    private String telefono;
    private String email;
    private String tipoCocinaPersonalizado;
    private TipoCocina tipoCocina;
    private Barrio barrio;
    private RangoPrecio rangoPrecio;
    private List<RestriccionDietetica> restriccionesDieteticas;
}
