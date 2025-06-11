package com.example.demo.controller;

import com.example.demo.entities.Notificacion;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.Usuario;
import com.example.demo.services.NotificacionService;
import com.example.demo.services.RestauranteService;
import com.example.demo.services.UsuarioService;

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
    private final UsuarioService usuarioService;

    // 🔔 Notificaciones de restaurante
    @GetMapping
    @PreAuthorize("hasRole('RESTAURANTE')")
    public ResponseEntity<List<Notificacion>> obtenerParaRestaurante(@RequestParam Long restauranteId) {
        Restaurante restaurante = restauranteService.obtenerRestaurantePorUsuario(restauranteId);
        if (restaurante == null) {
            return ResponseEntity.status(404).build();
        }
        return ResponseEntity.ok(notificacionService.obtenerNoVistas(restaurante));
    }

    // 🔔 Notificaciones de usuario
    @GetMapping("/usuario")
    @PreAuthorize("hasRole('USUARIO')")
    public ResponseEntity<List<Notificacion>> obtenerParaUsuario(@RequestParam Long usuarioId) {
        Usuario usuario = usuarioService.getUsuarioById(usuarioId);
        if (usuario == null) {
            return ResponseEntity.status(404).build();
        }
        return ResponseEntity.ok(notificacionService.obtenerNoVistas(usuario));
    }

    // 🔔 Notificaciones del admin
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<?>> obtenerParaAdmin() {
        var lista = notificacionService.obtenerTodasParaAdminNoVistas()
                .stream()
                .map(n -> java.util.Map.of(
                        "id", n.getId(),
                        "mensaje", n.getMensaje()))
                .toList();
        return ResponseEntity.ok(lista);
    }

    // ✅ Marcar notificación como vista
    @PutMapping("/{id}/marcar-vista")
    @PreAuthorize("hasRole('RESTAURANTE') or hasRole('ADMIN') or hasRole('USUARIO')")
    public ResponseEntity<?> marcarVista(@PathVariable Long id) {
        notificacionService.marcarComoVista(id);
        return ResponseEntity.ok().build();
    }
}