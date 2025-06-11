package com.example.demo.repositories;

import com.example.demo.entities.Restaurante;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface RestauranteRepository extends JpaRepository<Restaurante, Long> {
    Restaurante findByUsuarioId(Long idUsuario);
    List<Restaurante> findTop5ByOrderByIdDesc();
    List<Restaurante> findByNombreContainingIgnoreCase(String nombre);
    Optional<Restaurante> findByUsuarioEmail(String email);
    List<Restaurante> findBySolicitaBajaTrue();



}
