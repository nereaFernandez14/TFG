package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entities.PeticionAdmin;

public interface PeticionAdminRepository extends JpaRepository<PeticionAdmin, Long> {
    List<PeticionAdmin> findAllByRevisadaIsFalse();
}
