package com.example.demo.controller;

import com.example.demo.dto.ResenyaDenunciaDTO;
import com.example.demo.dto.RestauranteUpdateRequest;
import com.example.demo.dto.SolicitudModificacionDTO;
import com.example.demo.dto.SolicitudModificacionUsuarioDTO;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.SolicitudModificacion;
import com.example.demo.entities.SolicitudModificacionUsuario;
import com.example.demo.entities.Usuario;
import com.example.demo.repositories.SolicitudModificacionUsuarioRepository;
import com.example.demo.repositories.UsuarioRepository;
import com.example.demo.services.AdminService;
import com.example.demo.services.NotificacionService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    private final SolicitudModificacionUsuarioRepository solicitudUsuarioRepository;

    @GetMapping("/denuncias")
    public ResponseEntity<List<ResenyaDenunciaDTO>> obtenerDenuncias() {
        return ResponseEntity.ok(adminService.obtenerResenyasDenunciadas());
    }

    @PostMapping("/denuncias/{id}/aceptar")
    public ResponseEntity<?> aceptarDenuncia(@PathVariable Long id) {
        adminService.aceptarDenuncia(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/denuncias/{id}/rechazar")
    public ResponseEntity<?> rechazarDenuncia(@PathVariable Long id) {
        adminService.rechazarDenuncia(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/bajas-restaurantes")
    public ResponseEntity<List<Restaurante>> obtenerRestaurantesParaBaja() {
        return ResponseEntity.ok(adminService.obtenerRestaurantesParaBaja());
    }

    @DeleteMapping("/restaurantes/{id}")
    public ResponseEntity<?> eliminarRestaurante(@PathVariable Long id) {
        adminService.eliminarRestaurante(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/bajas-usuarios")
    public ResponseEntity<List<Usuario>> obtenerUsuariosParaBaja() {
        return ResponseEntity.ok(adminService.obtenerUsuariosParaBaja());
    }

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

    @PutMapping("/usuarios/{id}/modificar")
    public ResponseEntity<?> modificarUsuarioDesdeAdmin(@PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        String campo = payload.get("campo");
        String nuevoValor = payload.get("nuevoValor");

        if (campo == null || nuevoValor == null) {
            return ResponseEntity.badRequest().body("Faltan datos");
        }

        Usuario usuario = usuarioRepository.findById(id).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(404).body("Usuario no encontrado");
        }

        switch (campo.toLowerCase()) {
            case "nombre" -> usuario.setNombre(nuevoValor);
            case "apellidos" -> usuario.setApellidos(nuevoValor);
            default -> {
                return ResponseEntity.badRequest().body("Campo no válido");
            }
        }

        usuarioRepository.save(usuario);

        SolicitudModificacionUsuario solicitud = solicitudUsuarioRepository.findByUsuarioIdAndCampo(id, campo);
        if (solicitud != null) {
            solicitud.setGestionada(true);
            solicitud.setAceptada(true);
            solicitudUsuarioRepository.save(solicitud);
        }

        notificacionService.crear(usuario,
                "✅ El administrador ha aceptado tu solicitud de modificación del campo '" + campo + "'");

        return ResponseEntity.ok(Map.of("mensaje", "Usuario actualizado"));
    }

    @GetMapping("/modificaciones")
    public ResponseEntity<List<SolicitudModificacionDTO>> obtenerSolicitudesModificacion() {
        List<SolicitudModificacion> solicitudes = adminService.obtenerSolicitudesModificacion();
        List<SolicitudModificacionDTO> dtos = solicitudes.stream()
                .map(SolicitudModificacionDTO::new)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/modificaciones-usuarios")
    public ResponseEntity<List<SolicitudModificacionUsuarioDTO>> obtenerSolicitudesModUsuario() {
        List<SolicitudModificacionUsuario> solicitudes = adminService.obtenerSolicitudesModificacionUsuario();
        List<SolicitudModificacionUsuarioDTO> dtos = solicitudes.stream()
                .map(SolicitudModificacionUsuarioDTO::new)
                .toList();
        return ResponseEntity.ok(dtos);
    }


    @PostMapping("/modificaciones/{id}/aceptar")
    public ResponseEntity<?> aceptarModificacionRestaurante(@PathVariable Long id) {
        adminService.resolverModificacionRestaurante(id, true);
        return ResponseEntity.ok(Map.of("mensaje", "Solicitud aceptada"));
    }

    @PostMapping("/modificaciones/{id}/rechazar")
    public ResponseEntity<?> rechazarModificacionRestaurante(@PathVariable Long id) {
        adminService.resolverModificacionRestaurante(id, false);
        return ResponseEntity.ok(Map.of("mensaje", "Solicitud rechazada"));
    }

    @PostMapping("/modificaciones-usuarios/{id}/aceptar")
    public ResponseEntity<?> aceptarModificacionUsuario(@PathVariable Long id) {
        adminService.resolverModificacionUsuario(id, true);
        return ResponseEntity.ok(Map.of("mensaje", "Solicitud aceptada"));
    }

    @PostMapping("/modificaciones-usuarios/{id}/rechazar")
    public ResponseEntity<?> rechazarModificacionUsuario(@PathVariable Long id) {
        adminService.resolverModificacionUsuario(id, false);
        return ResponseEntity.ok(Map.of("mensaje", "Solicitud rechazada"));
    }
}