package com.example.demo.dto;
import com.example.demo.entities.SolicitudModificacionUsuario;

public record SolicitudModificacionUsuarioDTO(
    Long id,
    String campo,
    String nuevoValor,
    boolean gestionada,
    Boolean aceptada,
    Long usuarioId,
    String usuarioNombre,
    String usuarioApellidos,
    String usuarioEmail
) {
    public SolicitudModificacionUsuarioDTO(SolicitudModificacionUsuario s) {
        this(
            s.getId(),
            s.getCampo(),
            s.getNuevoValor(),
            s.isGestionada(),
            s.getAceptada(),
            s.getUsuario().getId(),
            s.getUsuario().getNombre(),
            s.getUsuario().getApellidos(),
            s.getUsuario().getEmail()
        );
    }
}
