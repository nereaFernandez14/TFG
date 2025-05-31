package com.example.demo.controller;

import com.example.demo.dto.ResenyaRequest;
import com.example.demo.entities.Resenya;
import com.example.demo.services.ResenyaService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ResenyaController {

    private final ResenyaService resenyaService;

    @PostMapping("/resenyas")
    @Transactional
    public ResponseEntity<?> crearResenya(@RequestBody ResenyaRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        String email = auth.getName();

        try {
            resenyaService.guardarResenya(
                    request.getContenido(),
                    request.getValoracion(),
                    request.getRestauranteId(),
                    email);
            return ResponseEntity.ok(Map.of("message", "Reseña guardada con éxito"));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/resenyas")
    @Transactional
    public ResponseEntity<?> actualizarResenya(@RequestBody ResenyaRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        String email = auth.getName();

        try {
            resenyaService.actualizarResenya(
                    request.getRestauranteId(),
                    email,
                    request.getContenido(),
                    request.getValoracion());
            return ResponseEntity.ok(Map.of("message", "Reseña actualizada con éxito"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }
}