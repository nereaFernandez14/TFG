package com.example.demo.controller;

import com.example.demo.entities.Restaurante;
import com.example.demo.entities.SolicitudModificacionUsuario;
import com.example.demo.entities.Usuario;
import com.example.demo.repositories.RestauranteRepository;
import com.example.demo.repositories.SolicitudModificacionUsuarioRepository;
import com.example.demo.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RestauranteRepository restauranteRepository;

    @Autowired
    private SolicitudModificacionUsuarioRepository solicitudUsuarioRepository;

    public record UsuarioDTO(Long id, String nombre, String apellidos, String email, String rol) {
    }

    @GetMapping("/perfil")
    public ResponseEntity<?> obtenerPerfil() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("No autenticado");
        }

        String email = auth.getName();
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null)
            return ResponseEntity.status(404).body("Usuario no encontrado");

        return ResponseEntity.ok(new UsuarioDTO(usuario.getId(), usuario.getNombre(), usuario.getApellidos(),
                usuario.getEmail(), usuario.getRol().name()));
    }

    @PreAuthorize("hasRole('RESTAURANTE')")
    @PostMapping("/subir-imagenes")
    public ResponseEntity<?> subirImagenes(@RequestParam("imagenes") List<MultipartFile> imagenes,
            @RequestParam("email") String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        Restaurante restaurante = restauranteRepository.findByUsuarioId(usuario.getId());
        if (restaurante == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurante no encontrado");
        }

        try {
            for (MultipartFile imagen : imagenes) {
                if (imagen.isEmpty())
                    continue;

                String nombreArchivo = System.currentTimeMillis() + "_"
                        + imagen.getOriginalFilename().replaceAll("[^a-zA-Z0-9\\.\\-_]", "_");
                Path destino = Paths.get(
                        System.getProperty("user.dir") + "/uploads/restaurantes/" + restaurante.getId(), nombreArchivo);
                Files.createDirectories(destino.getParent());
                Files.copy(imagen.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

                restaurante.getImagenes().add(nombreArchivo);
            }

            restauranteRepository.save(restaurante);
            return ResponseEntity.ok(Map.of("mensaje", "Imágenes subidas", "imagenesCargadas", imagenes.size()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al guardar imágenes", "detalle", e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('USUARIO')")
    @PostMapping("/{id}/solicitar-modificacion")
    public ResponseEntity<?> solicitarModificacionUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            Authentication auth) {

        String emailAutenticado = auth.getName();
        Usuario usuario = usuarioRepository.findById(id).orElse(null);

        if (usuario == null || !usuario.getEmail().equals(emailAutenticado)) {
            return ResponseEntity.status(403).body("No autorizado");
        }

        String campo = payload.get("campo");
        String nuevoValor = payload.get("nuevoValor");

        if (campo == null || nuevoValor == null || campo.isBlank() || nuevoValor.isBlank()) {
            return ResponseEntity.badRequest().body("Campo y valor obligatorios");
        }

        SolicitudModificacionUsuario solicitud = new SolicitudModificacionUsuario();
        solicitud.setCampo(campo);
        solicitud.setNuevoValor(nuevoValor);
        solicitud.setUsuario(usuario);
        solicitudUsuarioRepository.save(solicitud);

        return ResponseEntity.ok(Map.of("mensaje", "✅ Solicitud enviada"));
    }

    @PreAuthorize("hasAnyRole('USUARIO', 'RESTAURANTE')")
    @PostMapping("/{id}/solicitar-baja")
    public ResponseEntity<?> solicitarBaja(@PathVariable Long id, Authentication auth) {
        String email = auth.getName();
        Usuario usuario = usuarioRepository.findById(id).orElse(null);
        if (usuario == null || !usuario.getEmail().equals(email)) {
            return ResponseEntity.status(403).body("No autorizado");
        }

        usuario.setSolicitaBaja(true);
        usuarioRepository.save(usuario);
        return ResponseEntity.ok().build();
    }
}