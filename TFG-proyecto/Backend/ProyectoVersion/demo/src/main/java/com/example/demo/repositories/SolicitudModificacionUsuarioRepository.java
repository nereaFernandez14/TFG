package com.example.demo.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entities.SolicitudModificacionUsuario;
import com.example.demo.entities.Usuario;

public interface SolicitudModificacionUsuarioRepository extends JpaRepository<SolicitudModificacionUsuario, Long> {

    boolean existsByUsuarioAndCampoAndNuevoValor(Usuario usuario, String campo, String nuevoValor);

    void deleteByUsuarioId(Long usuarioId);

    List<SolicitudModificacionUsuario> findByUsuarioId(Long usuarioId);

    List<SolicitudModificacionUsuario> findByGestionadaFalse();

    SolicitudModificacionUsuario findByUsuarioIdAndCampo(Long usuarioId, String campo);

}
