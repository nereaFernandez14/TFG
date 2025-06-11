package com.example.demo.dto;

import com.example.demo.enums.Barrio;
import com.example.demo.enums.RangoPrecio;
import com.example.demo.enums.RestriccionDietetica;
import com.example.demo.enums.TipoCocina;
import lombok.Data;

import java.util.List;

@Data
public class RestauranteDashboardDatos {
    private int visitas;
    private int comentarios;
    private double valoracionPromedio;

    private String nombre;
    private String direccion;
    private String telefono;
    private String email;
    private TipoCocina tipoCocina;
    private String tipoCocinaPersonalizado;
    private Barrio barrio;
    private RangoPrecio rangoPrecio;
    private List<RestriccionDietetica> restricciones;
}
