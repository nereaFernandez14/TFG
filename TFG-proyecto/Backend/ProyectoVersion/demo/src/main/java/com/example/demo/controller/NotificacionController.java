package com.example.demo.controller;

import com.example.demo.entities.Notificacion;
import com.example.demo.entities.Restaurante;
import com.example.demo.services.NotificacionService;
import com.example.demo.services.RestauranteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;
    private final RestauranteService restauranteService;

    @GetMapping
    @PreAuthorize("hasRole('RESTAURANTE')")
    public ResponseEntity<List<Notificacion>> obtener(@RequestParam Long restauranteId) {
        Restaurante restaurante = restauranteService.obtenerRestaurantePorUsuario(restauranteId);
        if (restaurante == null) {
            return ResponseEntity.status(404).build();
        }
        return ResponseEntity.ok(notificacionService.obtenerNoVistas(restaurante));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<?>> obtenerParaAdmin() {
        var lista = notificacionService.obtenerTodasParaAdminNoVistas()
                .stream()
                .map(n -> {
                    return java.util.Map.of(
                            "id", n.getId(),
                            "mensaje", n.getMensaje());
                }).toList();
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}/marcar-vista")
    @PreAuthorize("hasRole('RESTAURANTE') or hasRole('ADMIN')")
    public ResponseEntity<?> marcarVista(@PathVariable Long id) {
        notificacionService.marcarComoVista(id);
        return ResponseEntity.ok().build();
    }

}