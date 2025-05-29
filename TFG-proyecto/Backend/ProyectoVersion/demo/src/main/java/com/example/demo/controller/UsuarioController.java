package com.example.demo.controller;

import com.example.demo.entities.Usuario;
import com.example.demo.entities.ChangePasswordRequest;
import com.example.demo.entities.Rol;
import com.example.demo.repositories.RolRepository;
import com.example.demo.repositories.UsuarioRepository;
import com.example.demo.services.UsuarioService;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@CrossOrigin(origins = "https://localhost:4200", allowCredentials = "true")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private RolRepository rolRepository;

    @GetMapping("/usuarios")
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    @PostMapping("/usuario")
    public Usuario crearUsuario(@RequestBody Usuario usuario) {
        Rol rol = rolRepository.findByNombreIgnoreCase("CLIENTE")
                .orElseThrow(() -> new RuntimeException("Rol CLIENTE no encontrado"));

        usuario.setRol(rol);
        return usuarioRepository.save(usuario);
    }

    @GetMapping("/usuarios/por-rol/{nombreRol}")
    public ResponseEntity<?> getUsuariosPorRol(@PathVariable String nombreRol) {
        Optional<Rol> rolOptional = rolRepository.findByNombreIgnoreCase(nombreRol);
        if (rolOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Rol no encontrado: " + nombreRol);
        }

        List<Usuario> usuarios = usuarioRepository.findByRol(rolOptional.get());
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/perfil")
    public ResponseEntity<?> obtenerPerfilUsuario(HttpSession session) {
        String email = (String) session.getAttribute("usuario");

        if (email == null) {
            return ResponseEntity.status(401).body("Usuario no autenticado");
        }

        Optional<Usuario> usuarioOptional = usuarioRepository.findByEmail(email);
        if (usuarioOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Usuario no encontrado");
        }

        Usuario usuario = usuarioOptional.get();
        return ResponseEntity.ok(Map.of(
                "nombre", usuario.getNombre(),
                "apellidos", usuario.getApellidos(),
                "email", usuario.getEmail(),
                "rol", usuario.getRol().getNombre() 
        ));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> cambiarPassword(@RequestBody ChangePasswordRequest request, Principal principal) {
        System.out.println("👉 Principal: " + (principal != null ? principal.getName() : "null")); // 👈 AÑADIDO

        try {
            usuarioService.cambiarPassword(principal.getName(), request);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

}