package com.example.demo.repositories;

import com.example.demo.entities.ImagenRestaurante;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImagenRestauranteRepository extends JpaRepository<ImagenRestaurante, Long> {

    List<ImagenRestaurante> findByRestauranteId(Long id);
}