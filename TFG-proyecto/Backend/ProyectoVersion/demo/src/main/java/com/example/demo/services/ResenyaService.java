package com.example.demo.services;

import com.example.demo.entities.Resenya;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.Usuario;
import com.example.demo.repositories.ResenyaRepository;
import com.example.demo.repositories.RestauranteRepository;
import com.example.demo.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResenyaService {

    private final ResenyaRepository resenyaRepository;
    private final RestauranteRepository restauranteRepository;
    private final UsuarioRepository usuarioRepository;

    private static final List<String> PALABRAS_PROHIBIDAS = List.of("tonto", "gilipollas", "idiota");

    public Resenya guardarResenya(String contenido, int valoracion, Long restauranteId, String email) {
        Usuario autor = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        Restaurante restaurante = restauranteRepository.findById(restauranteId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurante no encontrado"));

        if (resenyaRepository.findByAutorAndRestaurante(autor, restaurante).isPresent()) {
            throw new IllegalStateException("Ya has reseñado este restaurante.");
        }

        validarContenido(contenido);

        Resenya nueva = new Resenya(contenido, valoracion, autor, restaurante);
        return resenyaRepository.save(nueva);
    }

    public Resenya actualizarResenya(Long restauranteId, String email, String contenido, Integer nuevaValoracion) {
        Usuario autor = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        Restaurante restaurante = restauranteRepository.findById(restauranteId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurante no encontrado"));

        Resenya existente = resenyaRepository.findByAutorAndRestaurante(autor, restaurante)
                .orElseThrow(() -> new IllegalArgumentException("No tienes una reseña para este restaurante"));

        if (!existente.getValoracion().equals(nuevaValoracion)) {
            throw new IllegalArgumentException("No se permite modificar la puntuación de la reseña.");
        }

        validarContenido(contenido);

        existente.setContenido(contenido);
        return resenyaRepository.save(existente);
    }

    private void validarContenido(String contenido) {
        for (String palabra : PALABRAS_PROHIBIDAS) {
            if (contenido.toLowerCase().contains(palabra)) {
                throw new IllegalArgumentException("El comentario contiene palabras inapropiadas.");
            }
        }
    }
    public List<Resenya> obtenerResenyasPorRestaurante(Long restauranteId) {
        return resenyaRepository.findByRestauranteId(restauranteId);
    }

}