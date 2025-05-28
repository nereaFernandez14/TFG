package com.example.demo.repositories;

import com.example.demo.entities.Resenya;
import com.example.demo.entities.Restaurante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResenyaRepository extends JpaRepository<Resenya, Long> {
    List<Resenya> findByRestaurante(Restaurante restaurante);
}
