package com.example.demo.controller;

import com.example.demo.entities.Usuario;
import com.example.demo.repositories.UsuarioRepository;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;




@RestController
@RequestMapping("/api")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;
    // ✅ DTO interno para limitar la información enviada
    public record UsuarioDTO(Long id, String nombre, String apellidos, String email, String rol) {
    }

    // ✅ Endpoint para obtener el perfil del usuario autenticado
    @GetMapping("/perfil")
    public ResponseEntity<?> obtenerPerfil() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Usuario no autenticado");
        }

        String email = authentication.getName(); // 👈 Asumiendo que el username es el email
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(404).body("Usuario no encontrado");
        }

        // ✅ Devolvemos solo los datos necesarios para el perfil
        return ResponseEntity.ok(new UsuarioDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellidos(),
                usuario.getEmail(),
                usuario.getRol().name() // 🔄 Convertimos enum a String
        ));
    }

    @PreAuthorize("hasAnyRole('USUARIO', 'RESTAURANTE')")
    @PostMapping("/usuarios/{id}/solicitar-baja")
    public ResponseEntity<?> solicitarBajaUsuario(@PathVariable Long id, Authentication auth) {
        String emailAutenticado = auth.getName();
        Usuario usuario = usuarioRepository.findById(id).orElse(null);

        if (usuario == null || !usuario.getEmail().equals(emailAutenticado)) {
            return ResponseEntity.status(403).body("No autorizado para solicitar esta baja");
        }

        usuario.setSolicitaBaja(true);
        usuarioRepository.save(usuario);
        return ResponseEntity.ok().build();
    }

}