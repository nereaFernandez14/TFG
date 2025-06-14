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
                            "id", nueva.getId()));

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
    public ResponseEntity<List<ResenyaResponse>> obtenerResenyasDeRestaurante(@PathVariable Long id) {
        try {
            List<ResenyaResponse> resenyas = resenyaService.obtenerResenyasPorRestaurante(id);
            return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_JSON) // <- Asegura tipo JSON
                .body(resenyas);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .contentType(MediaType.APPLICATION_JSON)
                .body(List.of()); // Devolver lista vacía, o un Map con error
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

    @DeleteMapping("/resenyas/{id}")
    @PreAuthorize("hasRole('USUARIO')")
    public ResponseEntity<?> borrarResenya(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        String email = auth.getName();

        try {
            resenyaService.borrarResenya(id, email);
            return ResponseEntity.ok(Map.of("message", "Reseña eliminada correctamente"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al eliminar la reseña"));
        }
    }

    @DeleteMapping("/imagenes/{id}")
    @PreAuthorize("hasRole('USUARIO')")
    public ResponseEntity<?> borrarImagen(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        String email = auth.getName();

        try {
            resenyaService.borrarImagen(id, email);
            return ResponseEntity.ok(Map.of("message", "Imagen eliminada correctamente"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al eliminar la imagen"));
        }
    }

    @PatchMapping("/api/resenyas/{id}/contenido")
    @PreAuthorize("hasRole('USUARIO')")
    public ResponseEntity<?> borrarContenido(@PathVariable Long id) {
        boolean borrado = resenyaService.borrarContenidoResenya(id);
        if (!borrado) {
            return ResponseEntity.status(404).body(Map.of("error", "Reseña no encontrada"));
        }
        return ResponseEntity.ok(Map.of("mensaje", "Contenido de la reseña eliminado"));
    }

    @PatchMapping("/resenyas/{id}/contenido")
    @PreAuthorize("hasRole('USUARIO')")
    public ResponseEntity<?> borrarContenidoDeResena(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        try {
            boolean actualizado = resenyaService.borrarContenidoResenya(id);
            if (!actualizado) {
                return ResponseEntity.status(404).body(Map.of("error", "Reseña no encontrada"));
            }
            return ResponseEntity.ok(Map.of("message", "Contenido eliminado"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al borrar contenido de reseña"));
        }
    }

}