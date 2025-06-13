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
import java.util.Set;
import java.util.stream.Collectors;

import com.example.demo.entities.Usuario;
import com.example.demo.enums.RestriccionDietetica;
import com.example.demo.dto.RestauranteDTO;
import com.example.demo.entities.Restaurante;
import com.example.demo.repositories.UsuarioRepository;
import com.example.demo.repositories.RestauranteRepository;
import com.example.demo.services.NotificacionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RestauranteRepository restauranteRepository;

    @Autowired
    private NotificacionService notificacionService;

    public record UsuarioDTO(
            Long id,
            String nombre,
            String apellidos,
            String email,
            String rol,
            List<String> restriccionesDieteticas) {
    }

    @GetMapping("/perfil")
    public ResponseEntity<?> obtenerPerfil() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("No autenticado");
        }

        String email = authentication.getName();
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null)
            return ResponseEntity.status(404).body("Usuario no encontrado");
    }

    List<String> restricciones = usuario.getRestriccionesDieteticas()
                .stream()
                .map(Enum::name)
                .collect(Collectors.toList());

    return ResponseEntity.ok(new UsuarioDTO(usuario.getId(),usuario.getNombre(),usuario.getApellidos(),usuario.getEmail(),usuario.getRol().name(),restricciones));
    }

    @PreAuthorize("hasAnyRole('USUARIO', 'RESTAURANTE')")
    @PostMapping("/usuarios/{id}/solicitar-baja")
    public ResponseEntity<?> solicitarBajaUsuario(@PathVariable Long id, Authentication auth) {
        String emailAutenticado = auth.getName();
        Usuario usuario = usuarioRepository.findById(id).orElse(null);

        if (usuario == null || !usuario.getEmail().equals(emailAutenticado)) {
            return ResponseEntity.status(403).body("No autorizado para solicitar esta baja");
        }

        usuario.setSolicitaBaja(true);
        usuarioRepository.save(usuario);

        // 🔔 Notificar al administrador
        Usuario admin = usuarioRepository.findByRol(com.example.demo.enums.RolNombre.ADMIN)
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrador no encontrado"));

        String mensaje = "El usuario " + usuario.getNombre() + " " + usuario.getApellidos() + " ha solicitado su baja.";
        notificacionService.crearParaAdmin(mensaje, usuario);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/usuarios/subir-imagenes")
    @PreAuthorize("hasRole('RESTAURANTE')")
    public ResponseEntity<?> subirImagenesRestaurante(
            @RequestParam("imagenes") List<MultipartFile> imagenes,
            @RequestParam("email") String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        Restaurante restaurante = restauranteRepository.findByUsuarioId(usuario.getId());
        if (restaurante == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurante no encontrado");
        }

        try {
            for (MultipartFile imagen : imagenes) {
                if (imagen.isEmpty())
                    continue;

                String nombreArchivo = System.currentTimeMillis() + "_" +
                        imagen.getOriginalFilename().replaceAll("[^a-zA-Z0-9\\.\\-_]", "_");

                String basePath = System.getProperty("user.dir") + "/uploads/restaurantes/" + restaurante.getId();
                Path destino = Paths.get(basePath, nombreArchivo);
                Files.createDirectories(destino.getParent());
                Files.copy(imagen.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

                restaurante.getImagenes().add(nombreArchivo);
            }

            restauranteRepository.save(restaurante);

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Imágenes subidas y registradas en BD",
                    "imagenesCargadas", imagenes.size()));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", "Error al guardar imágenes", "detalle", e.getMessage()));
        }
    }

    @PutMapping("/usuarios/{id}/preferencias-dieteticas")
    @PreAuthorize("hasRole('USUARIO')")
    public ResponseEntity<?> actualizarPreferencias(
            @PathVariable Long id,
            @RequestBody List<String> restricciones,
            Authentication auth) {

        String emailAutenticado = auth.getName();
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (!usuario.getEmail().equals(emailAutenticado)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No autorizado");
        }

        Set<RestriccionDietetica> restriccionesConvertidas = restricciones.stream()
                .map(String::toUpperCase)
                .map(RestriccionDietetica::valueOf)
                .collect(Collectors.toSet());

        usuario.setRestriccionesDieteticas(restriccionesConvertidas);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of("mensaje", "Preferencias actualizadas correctamente"));
    }
}
