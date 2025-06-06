package com.example.demo.controller;

import com.example.demo.entities.Resenya;
import com.example.demo.entities.Restaurante;
import com.example.demo.services.AdminService;
import com.example.demo.dto.RestauranteUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/resenyas/ofensivas/{restauranteId}")
    public ResponseEntity<List<Resenya>> obtenerOfensivas(@PathVariable Long restauranteId) {
        return ResponseEntity.ok(adminService.obtenerResenyasOfensivas(restauranteId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/resenya/{id}")
    public ResponseEntity<Void> eliminarResenya(@PathVariable Long id) {
        adminService.eliminarResenya(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/restaurante/{id}")
    public ResponseEntity<Restaurante> modificarDatos(
            @PathVariable Long id,
            @RequestBody RestauranteUpdateRequest dto) {
        Restaurante actualizado = adminService.modificarDatosRestaurante(
                id,
                dto.getDireccion(),
                dto.getEmail(),
                dto.getTelefono());
        return ResponseEntity.ok(actualizado);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/restaurante/{id}")
    public ResponseEntity<Void> eliminarRestaurante(@PathVariable Long id) {
        adminService.eliminarRestaurante(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/restaurantes/solicitudes-baja")
    public ResponseEntity<List<Restaurante>> listarParaBaja() {
        return ResponseEntity.ok(adminService.listarRestaurantesConSolicitudBaja());
    }
}