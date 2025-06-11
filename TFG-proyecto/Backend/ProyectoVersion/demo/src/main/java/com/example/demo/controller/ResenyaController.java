package com.example.demo.controller;

import com.example.demo.dto.ResenyaRequest;
import com.example.demo.dto.ResenyaResponse;
import com.example.demo.entities.Resenya;
import com.example.demo.services.ResenyaService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequiredArgsConstructor
public class ResenyaController {

    private final ResenyaService resenyaService;

    @PostMapping("/resenyas")
    @Transactional
    public ResponseEntity<?> crearResenya(@ModelAttribute ResenyaRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        String email = auth.getName();

        try {
            Resenya nueva = resenyaService.guardarResenya(
                    request.getContenido(),
                    request.getValoracion(),
                    request.getRestauranteId(),
                    email,
                    request.getImagenes());

            return ResponseEntity
                    .status(201)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "message", "Reseña guardada con éxito ✅",
                            "id", nueva.getId()
                    ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error interno al guardar la reseña"));
        }
    }


    @PutMapping("/resenyas")
    @Transactional
    public ResponseEntity<?> actualizarResenya(@ModelAttribute ResenyaRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        String email = auth.getName();

        try {
            Resenya actualizada = resenyaService.actualizarResenya(
                    request.getRestauranteId(),
                    email,
                    request.getContenido(),
                    request.getImagenes());
            return ResponseEntity.ok(Map.of("message", "Reseña actualizada con éxito", "id", actualizada.getId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/restaurantes/{id}/resenas")
    public ResponseEntity<?> obtenerResenyasDeRestaurante(@PathVariable Long id) {
        try {
            List<ResenyaResponse> resenyas = resenyaService.obtenerResenyasPorRestaurante(id);
            return ResponseEntity.ok(resenyas);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al obtener reseñas"));
        }
    }

    @GetMapping("/resenyas/usuario/{restauranteId}")
    public ResponseEntity<?> revisarResenyaUsuario(@PathVariable Long restauranteId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        String email = auth.getName();
        boolean existe = resenyaService.usuarioYaHaResenyado(restauranteId, email);
        return ResponseEntity.ok(Map.of("yaExiste", existe));
    }

    @GetMapping("/imagenes/{id}")
    public ResponseEntity<byte[]> obtenerImagen(@PathVariable Long id) {
        try {
            var imagen = resenyaService.obtenerImagenPorId(id);
            return ResponseEntity.ok()
                    .header("Content-Type", imagen.getTipo())
                    .body(imagen.getDatos());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    @PreAuthorize("hasRole('RESTAURANTE')")
    @PostMapping("/resenyas/{id}/denunciar")
    public ResponseEntity<?> denunciarResenya(@PathVariable Long id) {
        Optional<Resenya> optional = resenyaService.obtenerPorId(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Reseña no encontrada"));
        }

        Resenya resenya = optional.get();
        resenya.setDenunciado(true);
        resenyaService.guardar(resenya); // guardar actualiza

        return ResponseEntity.ok(Map.of("message", "La reseña ha sido denunciada correctamente"));
    }


}