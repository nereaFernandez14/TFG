package com.example.demo.controller;

import com.example.demo.entities.Resenya;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.Usuario;
import com.example.demo.services.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // Protege todos los endpoints de este controlador
public class AdminController {

    private final AdminService adminService;

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
}
