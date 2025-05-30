package com.example.demo.controller;

import com.example.demo.entities.Usuario;
import com.example.demo.repositories.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ChangePasswordController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/change-password")
    @Transactional
    public ResponseEntity<?> cambiarPassword(@RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("No autenticado");
        }

        String email = authentication.getName();
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(404).body("Usuario no encontrado");
        }

        // Validar contraseña actual
        if (!passwordEncoder.matches(request.currentPassword(), usuario.getPassword())) {
            return ResponseEntity.status(403).body("La contraseña actual es incorrecta");
        }

        // Cambiar la contraseña
        usuario.setPassword(passwordEncoder.encode(request.newPassword()));
        usuarioRepository.save(usuario);

        return ResponseEntity.ok("Contraseña cambiada correctamente");
    }

    public record ChangePasswordRequest(String currentPassword, String newPassword) {}
}
