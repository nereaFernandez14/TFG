package com.example.demo.controller;

import com.example.demo.entities.Restaurante;
import com.example.demo.entities.Usuario;
import com.example.demo.repositories.RestauranteRepository;
import com.example.demo.repositories.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/restaurantes")
public class RestauranteController {

    @Autowired
    private RestauranteRepository restauranteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    //Crear un restaurante y asignarle un dueño
    @PostMapping
    public Restaurante crearRestaurante(@RequestParam Long idUsuario,
                                        @RequestBody Restaurante restaurante) {
        Usuario usuario = usuarioRepository.findById(idUsuario).orElseThrow();
        restaurante.setUsuario(usuario);
        return restauranteRepository.save(restaurante);
    }

    //Obtener todos los restaurantes
    @GetMapping
    public List<Restaurante> getAllRestaurantes() {
        return restauranteRepository.findAll();
    }

    //Obtener un restaurante por ID
    @GetMapping("/{id}")
    public Restaurante getRestauranteById(@PathVariable Long id) {
        return restauranteRepository.findById(id).orElseThrow();
    }

    //Obtener restaurante por ID del usuario dueño
    @GetMapping("/mio")
    public Restaurante getRestauranteByUsuario(@RequestParam Long idUsuario) {
        return restauranteRepository.findByUsuarioId(idUsuario);
    }
    @GetMapping("/destacados")
    public List<Restaurante> getRestaurantesDestacados() {
        // Ejemplo: los 5 primeros
        return restauranteRepository.findTop5ByOrderByIdDesc();
    }
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarRestaurantes(@RequestParam String nombre) {
        System.out.println("Buscando: " + nombre); // 🔍 LOG
        List<Restaurante> resultados = restauranteRepository.findByNombreContainingIgnoreCase(nombre);
        System.out.println("Encontrados: " + resultados.size()); // 🔍 LOG
        return ResponseEntity.ok(resultados);
    }


}
