package com.example.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.demo.entities.Usuario;
import com.example.demo.enums.RestriccionDietetica;
import com.example.demo.enums.RolNombre;
import com.example.demo.exception.DangerException;
import com.example.demo.dto.RegistroRequest;
import com.example.demo.dto.RestauranteDTO;
import com.example.demo.entities.ImagenRestaurante;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.SolicitudModificacionUsuario;
import com.example.demo.repositories.UsuarioRepository;
import com.example.demo.repositories.RestauranteRepository;
import com.example.demo.repositories.SolicitudModificacionUsuarioRepository;
import com.example.demo.services.NotificacionService;
import com.example.demo.services.UsuarioService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RestauranteRepository restauranteRepository;

    @Autowired
    private SolicitudModificacionUsuarioRepository solicitudUsuarioRepository;

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private UsuarioService usuarioService;

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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Usuario no autenticado");
        }

        String email = authentication.getName();
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(404).body("Usuario no encontrado");
        }

        List<String> restricciones = usuario.getRestriccionesDieteticas()
                .stream()
                .map(Enum::name)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new UsuarioDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellidos(),
                usuario.getEmail(),
                usuario.getRol().name(),
                restricciones));
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
        return ResponseEntity.ok().build();
    }

    @PostMapping("/usuarios/subir-imagenes")
    @PreAuthorize("hasRole('RESTAURANTE')")
    public ResponseEntity<?> subirImagenesRestaurante(
            @RequestParam("imagenes") List<MultipartFile> imagenes,
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

                String nombreArchivo = System.currentTimeMillis() + "_" +
                        imagen.getOriginalFilename().replaceAll("[^a-zA-Z0-9\\.\\-_]", "_");

                String basePath = System.getProperty("user.dir") + "/uploads/restaurantes/" + restaurante.getId();
                Path destino = Paths.get(basePath, nombreArchivo);
                Files.createDirectories(destino.getParent());
                Files.copy(imagen.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

                try {
                    ImagenRestaurante imagenRestaurante = new ImagenRestaurante();
                    imagenRestaurante.setNombreArchivo(nombreArchivo);
                    imagenRestaurante.setTipo(imagen.getContentType());
                    imagenRestaurante.setDatos(imagen.getBytes());
                    imagenRestaurante.setRestaurante(restaurante);

                    restaurante.getImagenesBlob().add(imagenRestaurante);
                } catch (IOException e) {
                    throw new RuntimeException("❌ Error leyendo bytes de archivo", e);
                }
            }

            restauranteRepository.save(restaurante);

            return ResponseEntity.ok(Map.of(
                    "mensaje", "✅ Imágenes subidas y registradas en BD",
                    "imagenesCargadas", imagenes.size()));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", "❌ Error al guardar imágenes", "detalle", e.getMessage()));
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

    private boolean contienePalabrasMalSonantes(String texto) {
        List<String> palabrasProhibidas = List.of(
                "puta", "mierda", "gilipollas", "cabron", "imbecil", "coño", "zorra", "maldito", "joder");

        String textoNormalizado = texto.toLowerCase().replaceAll("[^a-záéíóúñ]", " ");

        for (String palabra : palabrasProhibidas) {
            if (textoNormalizado.contains(palabra)) {
                return true;
            }
        }

        return false;
    }

    @PreAuthorize("hasRole('USUARIO')")
    @PostMapping("/usuarios/{id}/solicitar-modificacion")
    public ResponseEntity<?> solicitarModificacionUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            Authentication auth) {

        try {
            String emailAutenticado = auth.getName();
            Usuario usuario = usuarioRepository.findById(id).orElse(null);

            if (usuario == null || !usuario.getEmail().equals(emailAutenticado)) {
                System.out.println("🚫 Usuario no encontrado o no coincide con autenticado");
                return ResponseEntity.status(403).body("No autorizado");
            }

            String campo = payload.get("campo");
            String nuevoValor = payload.get("nuevoValor");

            System.out.println("🧪 Campo recibido: " + campo);
            System.out.println("🧪 Valor recibido: " + nuevoValor);

            if (campo == null || nuevoValor == null || campo.isBlank() || nuevoValor.isBlank()) {
                return ResponseEntity.badRequest().body("Campo y valor obligatorios");
            }

            if (nuevoValor.length() < 2 || nuevoValor.length() > 70) {
                return ResponseEntity.badRequest().body("El valor debe tener entre 2 y 70 caracteres");
            }

            if (contienePalabrasMalSonantes(nuevoValor)) {
                return ResponseEntity.badRequest().body("El valor contiene palabras inapropiadas");
            }

            switch (campo.toLowerCase()) {
                case "nombre":
                case "apellidos":
                    if (!nuevoValor.matches("^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)(\\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$")) {
                        return ResponseEntity.badRequest()
                                .body("Formato inválido. Use mayúscula inicial por palabra");
                    }
                    break;

                case "email":
                    if (!nuevoValor.matches("^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$")) {
                        return ResponseEntity.badRequest().body("Formato de email inválido");
                    }
                    break;

                default:
                    return ResponseEntity.badRequest().body("Campo no válido");
            }

            // 🔄 Crear y guardar la solicitud
            SolicitudModificacionUsuario solicitud = new SolicitudModificacionUsuario();
            solicitud.setCampo(campo);
            solicitud.setNuevoValor(nuevoValor);
            solicitud.setUsuario(usuario);

            solicitudUsuarioRepository.save(solicitud);

            notificacionService.crearParaAdmin(
                    "✏️ El usuario '" + usuario.getNombre()
                            + "' solicita modificar el campo \"" + campo
                            + "\" con valor: '" + nuevoValor + "'",
                    usuario);

            return ResponseEntity.ok(Map.of("mensaje", "✅ Solicitud enviada"));
        } catch (Exception e) {
            System.err.println("❌ Error interno en solicitud de modificación:");
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Error inesperado al procesar la solicitud: " + e.getMessage());
        }
    }

    @GetMapping("/usuarios/existe-email")
    public ResponseEntity<?> verificarEmailExistente(@RequestParam String email) {
        boolean existe = usuarioRepository.existsByEmail(email);
        return ResponseEntity.ok(Map.of("existe", existe));
    }

}