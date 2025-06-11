package com.example.demo.controller;

import com.example.demo.dto.RestauranteUpdateRequest;
import com.example.demo.entities.Notificacion;
import com.example.demo.entities.Resenya;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.SolicitudModificacion;
import com.example.demo.entities.Usuario;
import com.example.demo.services.AdminService;
import com.example.demo.services.NotificacionService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.demo.repositories.UsuarioRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final NotificacionService notificacionService;
    private final UsuarioRepository usuarioRepository;

    // 🗣 Obtener denuncias
    @GetMapping("/denuncias")
    public ResponseEntity<List<Resenya>> obtenerDenuncias() {
        return ResponseEntity.ok(adminService.obtenerResenyasDenunciadas());
    }

    // ✅ Aceptar una denuncia (elimina la reseña)
    @PostMapping("/denuncias/{id}/aceptar")
    public ResponseEntity<?> aceptarDenuncia(@PathVariable Long id) {
        adminService.aceptarDenuncia(id);
        return ResponseEntity.ok().build();
    }

    // ❌ Rechazar una denuncia
    @PostMapping("/denuncias/{id}/rechazar")
    public ResponseEntity<?> rechazarDenuncia(@PathVariable Long id) {
        adminService.rechazarDenuncia(id);
        return ResponseEntity.ok().build();
    }

    // 🔻 Restaurantes a eliminar
    @GetMapping("/bajas-restaurantes")
    public ResponseEntity<List<Restaurante>> obtenerRestaurantesParaBaja() {
        return ResponseEntity.ok(adminService.obtenerRestaurantesParaBaja());
    }

    // 🗑️ Eliminar restaurante
    @DeleteMapping("/restaurantes/{id}")
    public ResponseEntity<?> eliminarRestaurante(@PathVariable Long id) {
        adminService.eliminarRestaurante(id);
        return ResponseEntity.ok().build();
    }

    // 🚫 Usuarios a eliminar
    @GetMapping("/bajas-usuarios")
    public ResponseEntity<List<Usuario>> obtenerUsuariosParaBaja() {
        return ResponseEntity.ok(adminService.obtenerUsuariosParaBaja());
    }

    // 🗑️ Eliminar usuario
    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        adminService.eliminarUsuario(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/usuarios/{id}/rechazar-baja")
    public ResponseEntity<?> rechazarSolicitudBaja(@PathVariable Long id) {
        Usuario usuario = adminService.obtenerUsuarioPorId(id);
        if (usuario == null) {
            return ResponseEntity.status(404).body("Usuario no encontrado");
        }

        usuario.setSolicitaBaja(false);
        adminService.guardarUsuario(usuario);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/restaurantes/{id}")
    public ResponseEntity<?> modificarDatosRestaurante(
            @PathVariable Long id,
            @RequestBody RestauranteUpdateRequest request) {
        adminService.actualizarDatosRestaurante(id, request);
        return ResponseEntity.ok(Map.of("mensaje", "Actualizado"));
    }

    @GetMapping("/modificaciones")
    public ResponseEntity<List<SolicitudModificacion>> obtenerSolicitudesModificacion() {
        return ResponseEntity.ok(adminService.obtenerSolicitudesModificacion());
    }

}
