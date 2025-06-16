package com.example.demo.controller;

import com.example.demo.dto.ImagenRestauranteResponse;
import com.example.demo.dto.RestauranteDTO;
import com.example.demo.dto.RestauranteDashboardDatos;
import com.example.demo.entities.ImagenRestaurante;
import com.example.demo.entities.Resenya;
import com.example.demo.entities.Restaurante;
import com.example.demo.enums.Barrio;
import com.example.demo.enums.RangoPrecio;
import com.example.demo.enums.RestriccionDietetica;
import com.example.demo.enums.TipoCocina;
import com.example.demo.repositories.ImagenRestauranteRepository;
import com.example.demo.services.NotificacionService;
import com.example.demo.services.RestauranteService;

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
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/restaurantes")
public class RestauranteController {

    @Autowired
    private RestauranteService restauranteService;

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private ImagenRestauranteRepository imagenRestauranteRepository;

    @PostMapping
    public Restaurante crearRestaurante(@RequestParam Long idUsuario, @RequestBody @Valid RestauranteDTO dto) {
        return restauranteService.crearDesdeDTO(idUsuario, dto);
    }

    @GetMapping
    public List<Restaurante> getAllRestaurantes() {
        return restauranteService.obtenerTodosLosRestaurantes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestauranteDTO> getRestauranteById(@PathVariable Long id) {
        Restaurante restaurante = restauranteService.obtenerYIncrementarVisitas(id);
        if (restaurante == null) {
            return ResponseEntity.notFound().build();
        }
        RestauranteDTO dto = new RestauranteDTO(restaurante);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/mio")
    public ResponseEntity<RestauranteDTO> getRestauranteByUsuario(@RequestParam Long idUsuario) {
        Restaurante restaurante = restauranteService.obtenerRestaurantePorUsuario(idUsuario);
        if (restaurante == null) {
            return ResponseEntity.notFound().build();
        }
        List<ImagenRestaurante> imagenes = imagenRestauranteRepository.findByRestauranteId(restaurante.getId());
        RestauranteDTO dto = new RestauranteDTO(restaurante, imagenes);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/destacados")
    public List<Restaurante> getRestaurantesDestacados() {
        return restauranteService.obtenerTodosLosRestaurantes()
                .stream()
                .sorted((r1, r2) -> Long.compare(r2.getId(), r1.getId()))
                .limit(5)
                .toList();
    }

    @GetMapping("/buscar")
    public ResponseEntity<?> buscarRestaurantes(@RequestParam String nombre) {
        List<Restaurante> resultados = restauranteService.obtenerTodosLosRestaurantes()
                .stream()
                .filter(r -> r.getNombre().toLowerCase().contains(nombre.toLowerCase()))
                .toList();
        return ResponseEntity.ok(resultados);
    }

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

    @GetMapping("/dashboard")
    public ResponseEntity<RestauranteDTO> obtenerDashboard(@RequestParam Long idUsuario) {
        Restaurante restaurante = restauranteService.obtenerRestaurantePorUsuario(idUsuario);
        if (restaurante == null) {
            return ResponseEntity.notFound().build();
        }
        List<ImagenRestaurante> imagenes = imagenRestauranteRepository.findByRestauranteId(restaurante.getId());
        RestauranteDTO dto = new RestauranteDTO(restaurante, imagenes);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/usuario/{idUsuario}/imagenes")
    public ResponseEntity<List<ImagenRestauranteResponse>> obtenerImagenesPorUsuario(@PathVariable Long idUsuario) {
        Restaurante restaurante = restauranteService.obtenerRestaurantePorUsuario(idUsuario);
        if (restaurante == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        List<ImagenRestaurante> imagenes = imagenRestauranteRepository.findByRestauranteId(restaurante.getId());
        List<ImagenRestauranteResponse> response = imagenes.stream()
                .map(ImagenRestauranteResponse::new)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/imagenes")
    public ResponseEntity<List<ImagenRestauranteResponse>> obtenerImagenesPorIdRestaurante(@PathVariable Long id) {
        Restaurante restaurante = restauranteService.obtenerRestaurantePorId(id);
        if (restaurante == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        List<ImagenRestaurante> imagenes = imagenRestauranteRepository.findByRestauranteId(restaurante.getId());
        List<ImagenRestauranteResponse> response = imagenes.stream()
                .map(ImagenRestauranteResponse::new)
                .toList();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('RESTAURANTE')")
    @GetMapping("/resumen/{idUsuario}")
    public ResponseEntity<RestauranteDashboardDatos> obtenerResumen(@PathVariable Long idUsuario) {
        Restaurante restaurante = restauranteService.obtenerRestaurantePorUsuario(idUsuario);
        if (restaurante == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        RestauranteDashboardDatos datos = new RestauranteDashboardDatos();
        datos.setId(restaurante.getId());
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

    @PostMapping("/subir-menu")
    public ResponseEntity<?> subirMenu(@RequestParam("archivo") MultipartFile archivo,
            @RequestParam("email") String email) {

        try {
            Restaurante restaurante = restauranteService.obtenerRestaurantePorEmailUsuario(email);
            if (restaurante == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurante no encontrado");
            }

            String nombreArchivoSanitizado = restaurante.getNombre()
                    .replaceAll("[^a-zA-Z0-9\\-]", "") + "_" + archivo.getOriginalFilename();

            String basePath = System.getProperty("user.dir") + "/uploads/menus";
            Path rutaDestino = Paths.get(basePath, nombreArchivoSanitizado);
            Files.createDirectories(rutaDestino.getParent());
            Files.copy(archivo.getInputStream(), rutaDestino, StandardCopyOption.REPLACE_EXISTING);

            restaurante.setRutaMenu(nombreArchivoSanitizado);
            restauranteService.guardar(restaurante);

            return ResponseEntity.ok(Map.of("mensaje", "Archivo subido exitosamente ✅"));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al subir archivo: " + e.getMessage());
        }
    }

    @GetMapping("/menus/{nombreArchivo:.+}")
    public ResponseEntity<Resource> descargarMenu(@PathVariable String nombreArchivo) throws IOException {
        Path ruta = Paths.get(System.getProperty("user.dir") + "/uploads/menus").resolve(nombreArchivo).normalize();
        if (!Files.exists(ruta))
            return ResponseEntity.notFound().build();

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
        if (email == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Restaurante restaurante = restauranteService.obtenerRestaurantePorEmailUsuario(email);
        if (restaurante == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        return ResponseEntity.ok(restaurante.getResenyas());
    }

    @PostMapping("/{idRestaurante}/solicitar-baja")
    @PreAuthorize("hasRole('RESTAURANTE')")
    public ResponseEntity<?> solicitarBaja(@PathVariable Long idRestaurante) {
        Restaurante restaurante = restauranteService.obtenerRestaurantePorId(idRestaurante);
        if (restaurante == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Restaurante no encontrado");

        restaurante.setSolicitaBaja(true);
        restauranteService.guardar(restaurante);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('RESTAURANTE')")
    @PostMapping("/{id}/solicitar-modificacion")
    public ResponseEntity<?> solicitarModificacion(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Restaurante restaurante = restauranteService.obtenerRestaurantePorId(id);
        if (restaurante == null)
            return ResponseEntity.status(404).body("Restaurante no encontrado");

        String campo = payload.get("campo");
        String nuevoValor = payload.get("nuevoValor");

        if (campo == null || nuevoValor == null)
            return ResponseEntity.badRequest().body("Campo o valor inválido");

        try {
            notificacionService.crearSolicitudConNotificacion(restaurante, campo, nuevoValor);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error interno al procesar la solicitud");
        }
        return ResponseEntity.ok(Map.of("mensaje", "Modificación enviada y en espera de revisión"));
    }

    @PreAuthorize("hasRole('RESTAURANTE')")
    @PostMapping("/{id}/imagenes")
    public ResponseEntity<?> subirImagenes(@PathVariable Long id,
            @RequestParam("imagenes") List<MultipartFile> nuevasImagenes) {

        Restaurante restaurante = restauranteService.obtenerRestaurantePorUsuario(id);
        if (restaurante == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Restaurante no encontrado"));
        }

        try {
            for (MultipartFile imagen : nuevasImagenes) {
                String nombre = System.currentTimeMillis() + "_" + imagen.getOriginalFilename().replaceAll("\\s+", "");

                ImagenRestaurante entidad = new ImagenRestaurante();
                entidad.setRestaurante(restaurante);
                entidad.setNombreArchivo(nombre);
                entidad.setTipo(imagen.getContentType());
                entidad.setDatos(imagen.getBytes());

                imagenRestauranteRepository.save(entidad);
            }

            return ResponseEntity.ok(Map.of("mensaje", "✅ Imágenes añadidas correctamente"));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "❌ Error al guardar nuevas imágenes: " + e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('RESTAURANTE')")
    @DeleteMapping("/imagenes/{idImagen}")
    public ResponseEntity<?> eliminarImagen(@PathVariable Long idImagen) {
        Optional<ImagenRestaurante> imagenOpt = imagenRestauranteRepository.findById(idImagen);

        if (imagenOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Imagen no encontrada");
        }

        imagenRestauranteRepository.deleteById(idImagen);

        return ResponseEntity.ok(Map.of("mensaje", "✅ Imagen eliminada correctamente"));
    }

    @GetMapping("/uploads/{id}/{nombre:.+}")
    public ResponseEntity<Resource> obtenerImagenRestaurante(
            @PathVariable Long id,
            @PathVariable String nombre) throws IOException {

        Path ruta = Paths.get(System.getProperty("user.dir"), "uploads", "restaurantes", String.valueOf(id), nombre);

        if (!Files.exists(ruta))
            return ResponseEntity.notFound().build();

        Resource recurso = new UrlResource(ruta.toUri());

        String mimeType = Files.probeContentType(ruta);
        if (mimeType == null)
            mimeType = "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nombre + "\"")
                .body(recurso);
    }

    @GetMapping("/imagenes/{id}")
    public ResponseEntity<byte[]> obtenerImagenBlob(@PathVariable Long id) {
        ImagenRestaurante imagen = imagenRestauranteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Imagen no encontrada"));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(imagen.getTipo()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + imagen.getNombreArchivo() + "\"")
                .body(imagen.getDatos());
    }
}