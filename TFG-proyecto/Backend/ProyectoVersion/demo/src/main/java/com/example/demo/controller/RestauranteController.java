package com.example.demo.controller;

import com.example.demo.dto.RestauranteDTO;
import com.example.demo.entities.Restaurante;
import com.example.demo.enums.Barrio;
import com.example.demo.enums.RangoPrecio;
import com.example.demo.enums.RestriccionDietetica;
import com.example.demo.enums.TipoCocina;
import com.example.demo.services.RestauranteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/restaurantes")
public class RestauranteController {

    @Autowired
    private RestauranteService restauranteService;

    // ✅ Crear restaurante con validación de rol y lógica completa
    @PostMapping
    public Restaurante crearRestaurante(@RequestParam Long idUsuario,
            @RequestBody Restaurante restaurante) {
        return restauranteService.crearRestaurante(idUsuario, restaurante);
    }

    // Obtener todos los restaurantes
    @GetMapping
    public List<Restaurante> getAllRestaurantes() {
        return restauranteService.obtenerTodosLosRestaurantes();
    }

    // ✅ Obtener un restaurante por ID e incrementar visitas
    @GetMapping("/{id}")
    public Restaurante getRestauranteById(@PathVariable Long id) {
        return restauranteService.obtenerYIncrementarVisitas(id);
    }

    // Obtener restaurante por ID del usuario dueño
    @GetMapping("/mio")
    public Restaurante getRestauranteByUsuario(@RequestParam Long idUsuario) {
        return restauranteService.obtenerRestaurantePorUsuario(idUsuario);
    }

    // Restaurantes destacados (últimos 5)
    @GetMapping("/destacados")
    public List<Restaurante> getRestaurantesDestacados() {
        return restauranteService.obtenerTodosLosRestaurantes()
                .stream()
                .sorted((r1, r2) -> Long.compare(r2.getId(), r1.getId()))
                .limit(5)
                .toList();
    }

    // Buscar por nombre
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
            @RequestParam(required = false) List<RestriccionDietetica> restricciones) {

        return restauranteService.filtrarRestaurantesAvanzado(
                tipoCocina, barrio, rangoPrecio, minPuntuacion, restricciones);
    }

    // ✅ Endpoint para dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<RestauranteDTO> obtenerDashboard(@RequestParam Long idUsuario) {
        Restaurante restaurante = restauranteService.obtenerRestaurantePorUsuario(idUsuario);

        if (restaurante == null) {
            return ResponseEntity.notFound().build();
        }

        RestauranteDTO dto = new RestauranteDTO(restaurante);
        return ResponseEntity.ok(dto);
    }
}