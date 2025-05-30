package com.example.demo.dto;

import com.example.demo.enums.Barrio;
import com.example.demo.enums.RangoPrecio;
import com.example.demo.enums.RestriccionDietetica;
import com.example.demo.enums.TipoCocina;
import lombok.Data;

import java.util.List;

@Data
public class EnumsDTO {
    private List<TipoCocina> tiposCocina;
    private List<Barrio> barrios;
    private List<RangoPrecio> rangosPrecio;
    private List<RestriccionDietetica> restricciones;
}
