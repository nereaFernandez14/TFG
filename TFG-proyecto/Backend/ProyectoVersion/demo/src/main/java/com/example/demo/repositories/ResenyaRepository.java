package com.example.demo.repositories;

import com.example.demo.entities.ImagenResenya;
import com.example.demo.entities.Resenya;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResenyaRepository extends JpaRepository<Resenya, Long> {

    Optional<Resenya> findByAutorAndRestaurante(Usuario autor, Restaurante restaurante);

    List<Resenya> findByRestaurante(Restaurante restaurante);

    boolean existsByAutorAndRestaurante(Usuario autor, Restaurante restaurante);

    List<Resenya> findByRestauranteId(Long restauranteId);

    Optional<ImagenResenya> findImagenById(Long id);
    
    List<Resenya> findByDenunciadoTrue();

}