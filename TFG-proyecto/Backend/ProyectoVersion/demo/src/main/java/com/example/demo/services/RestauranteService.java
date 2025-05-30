package com.example.demo.services;

import com.example.demo.dto.RestauranteDTO;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.Usuario;
import com.example.demo.enums.Barrio;
import com.example.demo.enums.RangoPrecio;
import com.example.demo.enums.RestriccionDietetica;
import com.example.demo.enums.TipoCocina;
import com.example.demo.enums.RolNombre;
import com.example.demo.repositories.RestauranteRepository;
import com.example.demo.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RestauranteService {

    @Autowired
    private RestauranteRepository restauranteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Crear restaurante y asignar usuario, con validación de tipo de cocina y
     * filtro de palabras ofensivas.
     */
    public Restaurante crearRestaurante(Long idUsuario, Restaurante restaurante) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getRol() != RolNombre.RESTAURANTE) {
            throw new RuntimeException("No puede agregar un restaurante porque no tiene el rol RESTAURANTE.");
        }

        restaurante.setUsuario(usuario);

        if (restaurante.getTipoCocina() == TipoCocina.OTRO) {
            String personalizada = restaurante.getTipoCocinaPersonalizado();

            if (personalizada == null || personalizada.isBlank()) {
                throw new RuntimeException(
                        "Si se selecciona 'OTRO' como tipo de cocina, se debe especificar un valor personalizado.");
            }

            List<String> palabrasProhibidas = List.of("mierda", "puta", "gilipollas", "cabron", "joder", "idiota",
                    "coño", "imbécil", "hijo de puta", "hijos de puta", "imbéciles");
            String normalizado = personalizada.toLowerCase().replaceAll("[^a-záéíóúüñ]", "");

            for (String prohibida : palabrasProhibidas) {
                if (normalizado.contains(prohibida)) {
                    throw new RuntimeException(
                            "El tipo de cocina contiene lenguaje inapropiado. Por favor, elige otro término.");
                }
            }

        } else {
            restaurante.setTipoCocinaPersonalizado(null);
        }

        return restauranteRepository.save(restaurante);
    }

    public List<Restaurante> obtenerTodosLosRestaurantes() {
        return restauranteRepository.findAll();
    }

    public Restaurante obtenerRestaurantePorId(Long id) {
        return restauranteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurante no encontrado"));
    }

    public Restaurante obtenerRestaurantePorUsuario(Long idUsuario) {
        return restauranteRepository.findByUsuarioId(idUsuario);
    }

    /**
     * Lógica completa para devolver un restaurante y aumentar contador de visitas.
     */
    public Restaurante obtenerYIncrementarVisitas(Long id) {
        Restaurante restaurante = obtenerRestaurantePorId(id);
        restaurante.setVisitas(restaurante.getVisitas() + 1);
        return restauranteRepository.save(restaurante);
    }

    /**
     * Guardar restaurante desde fuera.
     */
    public Restaurante guardar(Restaurante restaurante) {
        return restauranteRepository.save(restaurante);
    }

    /**
     * Filtrado avanzado por cocina, barrio, precio, puntuación mínima y
     * restricciones dietéticas.
     */
    public List<RestauranteDTO> filtrarRestaurantesAvanzado(
            TipoCocina tipoCocina,
            Barrio barrio,
            RangoPrecio rangoPrecio,
            Double minPuntuacion,
            List<RestriccionDietetica> restricciones) {

        return restauranteRepository.findAll().stream()
                .filter(r -> tipoCocina == null || r.getTipoCocina() == tipoCocina)
                .filter(r -> barrio == null || r.getBarrio() == barrio)
                .filter(r -> rangoPrecio == null || r.getRangoPrecio() == rangoPrecio)
                .filter(r -> minPuntuacion == null || r.getMediaPuntuacion() >= minPuntuacion)
                .filter(r -> restricciones == null || restricciones.isEmpty()
                        || r.getRestriccionesDieteticas().containsAll(restricciones))
                .sorted(Comparator.comparingDouble(Restaurante::getMediaPuntuacion).reversed())
                .map(RestauranteDTO::new)
                .collect(Collectors.toList());
    }
}