package com.example.demo.repositories;

import com.example.demo.entities.Usuario;
import com.example.demo.entities.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    List<Usuario> findByRol(Rol rol);

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);
    Optional<Usuario> findByNombre(String nombre);


}
