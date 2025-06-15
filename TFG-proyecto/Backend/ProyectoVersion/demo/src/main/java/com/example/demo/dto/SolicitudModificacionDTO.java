package com.example.demo.dto;

import com.example.demo.entities.SolicitudModificacion;

public record SolicitudModificacionDTO(
        Long id,
        String campo,
        String nuevoValor,
        Long restauranteId,
        String nombreRestaurante) {
    public SolicitudModificacionDTO(SolicitudModificacion s) {
        this(s.getId(), s.getCampo(), s.getNuevoValor(),
                s.getRestaurante().getId(), s.getRestaurante().getNombre());
    }
}
