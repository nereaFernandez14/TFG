package com.example.demo.controller;

import com.example.demo.dto.RestauranteDTO;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.Usuario;
import com.example.demo.repositories.RestauranteRepository;
import com.example.demo.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/usuarios") // 🔥 SIN /api
public class FavoritosController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RestauranteRepository restauranteRepository;

    @PreAuthorize("hasRole('USUARIO')")
    @GetMapping("/{id}/favoritos")
    public ResponseEntity<List<RestauranteDTO>> obtenerFavoritos(@PathVariable Long id, Authentication auth) {
        Usuario usuario = validarUsuarioPropietario(id, auth);
        List<RestauranteDTO> favoritos = usuario.getFavoritos().stream()
                .map(RestauranteDTO::new)
                .toList();
        return ResponseEntity.ok(favoritos);
    }

    @PostMapping("/{id}/favoritos/{restauranteId}")
    @PreAuthorize("hasRole('USUARIO')")
    public ResponseEntity<?> agregarFavorito(@PathVariable Long id, @PathVariable Long restauranteId, Authentication auth) {
    System.out.println("🧪 Usuario autenticado: " + auth.getName());
    System.out.println("🧪 Authorities actuales: " + auth.getAuthorities());

        Usuario usuario = validarUsuarioPropietario(id, auth);
        Restaurante restaurante = restauranteRepository.findById(restauranteId)
                .orElseThrow(() -> new ResponseStatusException(404, "Restaurante no encontrado", null));

        usuario.getFavoritos().add(restaurante);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of("mensaje", "Restaurante añadido a favoritos"));
    }

    @PreAuthorize("hasRole('USUARIO')")
    @DeleteMapping("/{id}/favoritos/{restauranteId}")
    public ResponseEntity<?> quitarFavorito(@PathVariable Long id, @PathVariable Long restauranteId, Authentication auth) {
        Usuario usuario = validarUsuarioPropietario(id, auth);
        Restaurante restaurante = restauranteRepository.findById(restauranteId)
                .orElseThrow(() -> new ResponseStatusException(404, "Restaurante no encontrado", null));

        usuario.getFavoritos().remove(restaurante);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of("mensaje", "Restaurante eliminado de favoritos"));
    }

    private Usuario validarUsuarioPropietario(Long id, Authentication auth) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(404, "Usuario no encontrado", null));

        if (!usuario.getEmail().equals(auth.getName())) {
            throw new ResponseStatusException(403, "No autorizado",null);
        }

        return usuario;
    }
}
