package com.example.demo.repositories;

import com.example.demo.entities.Notificacion;
import com.example.demo.entities.Restaurante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByDestinatarioRestauranteAndVistaFalse(Restaurante restaurante);

    List<Notificacion> findByParaAdminTrueAndVistaFalse();
}
