package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entities.PeticionAdmin;
import com.example.demo.services.PeticionAdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/peticiones")
@RequiredArgsConstructor
public class PeticionAdminController {

    private final PeticionAdminService service;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pendientes")
    public List<PeticionAdmin> getPendientes() {
        return service.obtenerPendientes();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/aprobar")
    public ResponseEntity<?> aprobar(@PathVariable Long id) {
        service.aprobarPeticion(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/rechazar")
    public ResponseEntity<?> rechazar(@PathVariable Long id) {
        service.rechazarPeticion(id);
        return ResponseEntity.ok().build();
    }
}
