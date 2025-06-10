package com.example.demo.controller;

import com.example.demo.dto.RestauranteDTO;
import com.example.demo.dto.RestauranteDashboardDatos;
import com.example.demo.entities.Resenya;
import com.example.demo.entities.Restaurante;
import com.example.demo.enums.Barrio;
import com.example.demo.enums.RangoPrecio;
import com.example.demo.enums.RestriccionDietetica;
import com.example.demo.enums.TipoCocina;
import com.example.demo.services.NotificacionService;
import com.example.demo.services.RestauranteService;

import jakarta.annotation.security.PermitAll;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/restaurantes")
public class RestauranteController {

    @Autowired
    private RestauranteService restauranteService;

    @Autowired
    private NotificacionService notificacionService;

    // ✅ Crear restaurante
    @PostMapping
    public Restaurante crearRestaurante(@RequestParam Long idUsuario, @RequestBody @Valid RestauranteDTO dto) {
        return restauranteService.crearDesdeDTO(idUsuario, dto);
    }

    // ✅ Obtener todos
    @GetMapping
    public List<Restaurante> getAllRestaurantes() {
        return restauranteService.obtenerTodosLosRestaurantes();
    }

    // ✅ Obtener uno por ID (e incrementa visitas)
    @GetMapping("/{id}")
    public Restaurante getRestauranteById(@PathVariable Long id) {
        return restauranteService.obtenerYIncrementarVisitas(id);
    }

    // ✅ Obtener restaurante del usuario
    @GetMapping("/mio")
    public ResponseEntity<Restaurante> getRestauranteByUsuario(@RequestParam Long idUsuario) {
        Restaurante restaurante = restauranteService.obtenerRestaurantePorUsuario(idUsuario);
        if (restaurante == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(restaurante);
    }

    // ✅ Restaurantes destacados
    @GetMapping("/destacados")
    public List<Restaurante> getRestaurantesDestacados() {
        return restauranteService.obtenerTodosLosRestaurantes()
                .stream()
                .sorted((r1, r2) -> Long.compare(r2.getId(), r1.getId()))
                .limit(5)
                .toList();
    }

    // ✅ Buscar por nombre
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarRestaurantes(@RequestParam String nombre) {
        List<Restaurante> resultados = restauranteService.obtenerTodosLosRestaurantes()
                .stream()
                .filter(r -> r.getNombre().toLowerCase().contains(nombre.toLowerCase()))
                .toList();
        return ResponseEntity.ok(resultados);
    }

    // ✅ Filtro avanzado
    @GetMapping("/filtrar-avanzado")
    public List<RestauranteDTO> filtrarRestaurantesAvanzado(
            @RequestParam(required = false) TipoCocina tipoCocina,
            @RequestParam(required = false) Barrio barrio,
            @RequestParam(required = false) RangoPrecio rangoPrecio,
            @RequestParam(required = false) Double minPuntuacion,
            @RequestParam(required = false) List<RestriccionDietetica> restricciones,
            @RequestParam(required = false) String nombre) {

        return restauranteService.filtrarRestaurantesAvanzado(
                tipoCocina, barrio, rangoPrecio, minPuntuacion, restricciones, nombre);
    }

    // ✅ Dashboard para restaurante
    @GetMapping("/dashboard")
    public ResponseEntity<RestauranteDTO> obtenerDashboard(@RequestParam Long idUsuario) {
        Restaurante restaurante = restauranteService.obtenerRestaurantePorUsuario(idUsuario);
        if (restaurante == null) {
            return ResponseEntity.notFound().build();
        }
        RestauranteDTO dto = new RestauranteDTO(restaurante);
        return ResponseEntity.ok(dto);
    }

    // RestauranteController.java
    @PreAuthorize("hasRole('RESTAURANTE')")
    @GetMapping("/resumen/{idUsuario}")
    public ResponseEntity<RestauranteDashboardDatos> obtenerResumen(@PathVariable Long idUsuario) {
        Restaurante restaurante = restauranteService.obtenerRestaurantePorUsuario(idUsuario);
        var auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("👤 Usuario autenticado: " + auth.getName());
        System.out.println("🔐 Roles: " + auth.getAuthorities());
        if (restaurante == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        RestauranteDashboardDatos datos = new RestauranteDashboardDatos();
        datos.setVisitas(restaurante.getVisitas());
        datos.setComentarios(restaurante.getResenyas().size());
        datos.setValoracionPromedio(restaurante.getMediaPuntuacion());
        datos.setNombre(restaurante.getNombre());
        datos.setDireccion(restaurante.getDireccion());
        datos.setTelefono(restaurante.getTelefono());
        datos.setEmail(restaurante.getEmail());
        datos.setTipoCocina(restaurante.getTipoCocina());
        datos.setTipoCocinaPersonalizado(restaurante.getTipoCocinaPersonalizado());
        datos.setBarrio(restaurante.getBarrio());
        datos.setRangoPrecio(restaurante.getRangoPrecio());
        datos.setRestricciones(restaurante.getRestriccionesDieteticas());

        return ResponseEntity.ok(datos);
    }

    // ✅ Subir menú (PDF o imagen)
    @PostMapping("/subir-menu")
    public ResponseEntity<?> subirMenu(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("email") String email) {

        try {
            Restaurante restaurante = restauranteService.obtenerRestaurantePorEmailUsuario(email);
            if (restaurante == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurante no encontrado");
            }

            // Sanitizar y construir nombre
            String nombreArchivoSanitizado = restaurante.getNombre()
                    .replaceAll("[^a-zA-Z0-9\\-_]", "_") + "_" + archivo.getOriginalFilename();

            // Ruta segura
            String basePath = System.getProperty("user.dir") + "/uploads/menus";
            Path rutaDestino = Paths.get(basePath, nombreArchivoSanitizado);
            Files.createDirectories(rutaDestino.getParent());

            // Guardar archivo
            Files.copy(archivo.getInputStream(), rutaDestino, StandardCopyOption.REPLACE_EXISTING);

            // Guardar solo el nombre en BD
            restaurante.setRutaMenu(nombreArchivoSanitizado);
            restauranteService.guardar(restaurante);

            return ResponseEntity.ok(Map.of("mensaje", "Archivo subido exitosamente ✅"));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al subir archivo: " + e.getMessage());
        }
    }

    // ✅ Descargar menú
    @GetMapping("/menus/{nombreArchivo:.+}")
    public ResponseEntity<Resource> descargarMenu(@PathVariable String nombreArchivo) throws IOException {
        Path ruta = Paths.get(System.getProperty("user.dir") + "/uploads/menus").resolve(nombreArchivo).normalize();

        if (!Files.exists(ruta)) {
            return ResponseEntity.notFound().build();
        }
        Resource recurso = new UrlResource(ruta.toUri());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + recurso.getFilename() + "\"")
                .body(recurso);
    }

    @PreAuthorize("hasRole('RESTAURANTE')")
    @GetMapping("/mis-resenyas")
    public ResponseEntity<List<Resenya>> obtenerMisResenyas(HttpSession session) {
        String email = (String) session.getAttribute("usuario");
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Restaurante restaurante = restauranteService.obtenerRestaurantePorEmailUsuario(email);
        if (restaurante == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(restaurante.getResenyas());
    }

    @PreAuthorize("hasRole('RESTAURANTE')")
    @PostMapping("/{idUsuario}/solicitar-baja")
    public ResponseEntity<?> solicitarBaja(@PathVariable Long idUsuario) {
        Restaurante restaurante = restauranteService.obtenerRestaurantePorUsuario(idUsuario);
        if (restaurante == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurante no encontrado");
        }

        restaurante.setSolicitaBaja(true);
        restauranteService.guardar(restaurante);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('RESTAURANTE')")
    @PostMapping("/{id}/solicitar-modificacion")
    public ResponseEntity<?> solicitarModificacion(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        Restaurante restaurante = restauranteService.obtenerRestaurantePorId(id);
        if (restaurante == null) {
            return ResponseEntity.status(404).body("Restaurante no encontrado");
        }

        String campo = payload.get("campo");
        String nuevoValor = payload.get("nuevoValor");

        if (campo == null || nuevoValor == null) {
            return ResponseEntity.badRequest().body("Campo o valor inválido");
        }

        notificacionService.crearSolicitudConNotificacion(restaurante, campo, nuevoValor);
        return ResponseEntity.ok(Map.of("mensaje", "Modificación enviada y en espera de revisión"));
    }

}
