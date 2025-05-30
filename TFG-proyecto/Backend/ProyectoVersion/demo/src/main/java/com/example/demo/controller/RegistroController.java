package com.example.demo.controller;

import com.example.demo.entities.RegistroRequest;
import com.example.demo.entities.Usuario;
import com.example.demo.enums.RolNombre;
import com.example.demo.repositories.UsuarioRepository;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class RegistroController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping({ "/register", "/api/register" })

    public ResponseEntity<?> registrarUsuario(@Valid @RequestBody RegistroRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El email es obligatorio"));
        }

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "El email ya está registrado"));
        }

        RolNombre rol;
        try {
            rol = RolNombre.valueOf(request.getRol().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Rol inválido o no reconocido"));
        }

        if (rol == RolNombre.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "No se permite registrar usuarios con rol ADMIN"));
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(request.getNombre());
        nuevoUsuario.setApellidos(request.getApellidos());
        nuevoUsuario.setEmail(request.getEmail());
        nuevoUsuario.setPassword(passwordEncoder.encode(request.getPassword()));
        nuevoUsuario.setRol(rol);
        nuevoUsuario.setEstaRegistrado(true);

        usuarioRepository.save(nuevoUsuario);

        return ResponseEntity.ok(Map.of("message", "Usuario registrado correctamente"));
    }
}