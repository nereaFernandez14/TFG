package com.example.demo.repositories;

import com.example.demo.entities.Usuario;
import com.example.demo.enums.RolNombre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    boolean existsByEmail(String email);

    Optional<Usuario> findByNombre(String nombre);

    Optional<Usuario> findByEmail(String email);

    List<Usuario> findByRol(RolNombre rol);

    List<Usuario> findBySolicitaBajaTrue();

}
