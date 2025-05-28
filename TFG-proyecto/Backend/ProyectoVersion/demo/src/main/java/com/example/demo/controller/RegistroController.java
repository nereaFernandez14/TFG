package com.example.demo.controller;

import com.example.demo.entities.RegistroRequest;
import com.example.demo.entities.Rol;
import com.example.demo.entities.Usuario;
import com.example.demo.repositories.RolRepository;
import com.example.demo.repositories.UsuarioRepository;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "https://localhost:4200", allowCredentials = "true")
@RestController
public class RegistroController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registrarUsuario(@Valid @RequestBody RegistroRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "El email ya está registrado"));
        }

        Optional<Rol> rolOptional = rolRepository.findById(request.getRolId());
        if (rolOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Rol inválido o no encontrado"));
        }

        Rol rol = rolOptional.get();

        if (rol.getNombre().equalsIgnoreCase("ADMIN")) {
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