package com.example.demo.repositories;

import com.example.demo.entities.SolicitudModificacion;
import com.example.demo.entities.Restaurante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudModificacionRepository extends JpaRepository<SolicitudModificacion, Long> {
    List<SolicitudModificacion> findByRestaurante(Restaurante restaurante);

    boolean existsByRestauranteAndCampoAndNuevoValor(Restaurante restaurante, String campo, String nuevoValor);
}
