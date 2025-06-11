package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.ImagenResenya;

@Repository
public interface ImagenResenyaRepository extends JpaRepository<ImagenResenya, Long> {
}
