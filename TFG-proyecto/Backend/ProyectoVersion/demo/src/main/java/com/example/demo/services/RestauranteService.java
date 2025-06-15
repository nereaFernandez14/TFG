package com.example.demo.services;

import com.example.demo.dto.RestauranteDTO;
import com.example.demo.dto.RestauranteUpdateRequest;
import com.example.demo.entities.ImagenRestaurante;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.Usuario;
import com.example.demo.enums.Barrio;
import com.example.demo.enums.RangoPrecio;
import com.example.demo.enums.RestriccionDietetica;
import com.example.demo.enums.TipoCocina;
import com.example.demo.enums.RolNombre;
import com.example.demo.repositories.ImagenRestauranteRepository;
import com.example.demo.repositories.RestauranteRepository;
import com.example.demo.repositories.UsuarioRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RestauranteService {

    @Autowired
    private RestauranteRepository restauranteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ImagenRestauranteRepository imagenRestauranteRepository;

    public Restaurante crearDesdeDTO(Long idUsuario, RestauranteDTO dto) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getRol() != RolNombre.RESTAURANTE) {
            throw new RuntimeException("No tiene permisos para crear restaurante.");
        }

        Restaurante restaurante = new Restaurante();
        restaurante.setUsuario(usuario);
        restaurante.setNombre(dto.getNombre());
        restaurante.setDireccion(dto.getDireccion());
        restaurante.setTelefono(dto.getTelefono());
        restaurante.setEmail(dto.getEmail());
        restaurante.setTipoCocina(dto.getTipoCocina());
        restaurante.setBarrio(dto.getBarrio());
        restaurante.setRangoPrecio(dto.getRangoPrecio());
        restaurante.setTipoCocinaPersonalizado(dto.getTipoCocinaPersonalizado());
        restaurante.setRestriccionesDieteticas(dto.getRestricciones());
        restaurante.setDescripcion(dto.getDescripcion()); // <-- Añadido para descripción

        if (dto.getTelefono() != null && !dto.getTelefono().isBlank()) {
            restaurante.setPassword(passwordEncoder.encode(dto.getTelefono()));
        }

        if (restaurante.getTipoCocina() == TipoCocina.OTRO) {
            String personalizada = restaurante.getTipoCocinaPersonalizado();
            if (personalizada == null || personalizada.isBlank()) {
                throw new RuntimeException("Si el tipo de cocina es 'OTRO', debes especificar uno personalizado.");
            }

            List<String> malasPalabras = List.of("mierda", "puta", "gilipollas", "cabron", "joder", "idiota",
                    "imbécil");
            String texto = personalizada.toLowerCase().replaceAll("[^a-z]", "");
            for (String mala : malasPalabras) {
                if (texto.contains(mala)) {
                    throw new RuntimeException("El nombre personalizado contiene palabras ofensivas.");
                }
            }
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

    public Restaurante obtenerYIncrementarVisitas(Long id) {
        Restaurante restaurante = obtenerRestaurantePorId(id);
        restaurante.incrementarVisitas();
        return restauranteRepository.save(restaurante);
    }

    public Restaurante guardar(Restaurante restaurante) {
        return restauranteRepository.save(restaurante);
    }

    public List<RestauranteDTO> filtrarRestaurantesAvanzado(
            TipoCocina tipoCocina,
            Barrio barrio,
            RangoPrecio rangoPrecio,
            Double minPuntuacion,
            List<RestriccionDietetica> restricciones,
            String nombre) {

        return restauranteRepository.findAll().stream()
                .filter(r -> tipoCocina == null || r.getTipoCocina() == tipoCocina)
                .filter(r -> barrio == null || r.getBarrio() == barrio)
                .filter(r -> rangoPrecio == null || r.getRangoPrecio() == rangoPrecio)
                .filter(r -> minPuntuacion == null || r.getMediaPuntuacion() >= minPuntuacion)
                .filter(r -> restricciones == null || restricciones.isEmpty()
                        || r.getRestriccionesDieteticas().containsAll(restricciones))
                .filter(r -> nombre == null || r.getNombre() != null &&
                        r.getNombre().toLowerCase().contains(nombre.toLowerCase()))
                .sorted(Comparator.comparingDouble(Restaurante::getMediaPuntuacion).reversed())
                .map(RestauranteDTO::new)
                .collect(Collectors.toList());
    }

    public Restaurante obtenerRestaurantePorEmailUsuario(String email) {
        return restauranteRepository.findByUsuarioEmail(email).orElse(null);
    }

    public void actualizarDatosRestaurante(Long id, RestauranteUpdateRequest request) {
        Restaurante restaurante = restauranteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurante no encontrado"));

        if (request.getNombre() != null)
            restaurante.setNombre(request.getNombre());
        if (request.getDireccion() != null)
            restaurante.setDireccion(request.getDireccion());
        if (request.getTelefono() != null)
            restaurante.setTelefono(request.getTelefono());
        if (request.getEmail() != null)
            restaurante.setEmail(request.getEmail());
        if (request.getDescripcion() != null)
            restaurante.setDescripcion(request.getDescripcion());
        if (request.getTipoCocina() != null) {
            restaurante.setTipoCocina(request.getTipoCocina());

            // 🧼 Limpiar tipo personalizado si ya no es OTRO
            if (request.getTipoCocina() != TipoCocina.OTRO) {
                restaurante.setTipoCocinaPersonalizado(null);
            }
        }
        if (request.getTipoCocinaPersonalizado() != null)
            restaurante.setTipoCocinaPersonalizado(request.getTipoCocinaPersonalizado());
        if (request.getBarrio() != null)
            restaurante.setBarrio(request.getBarrio());
        if (request.getRestriccionesDieteticas() != null)
            restaurante.setRestriccionesDieteticas(request.getRestriccionesDieteticas());
        if (request.getRangoPrecio() != null)
            restaurante.setRangoPrecio(request.getRangoPrecio());

        restauranteRepository.save(restaurante);
    }

    @Transactional
    public void guardarImagenesBlob(Long restauranteId, MultipartFile[] archivos) {
        Restaurante restaurante = restauranteRepository.findById(restauranteId)
                .orElseThrow(() -> new RuntimeException("Restaurante no encontrado"));

        for (MultipartFile archivo : archivos) {
            if (!archivo.isEmpty()) {
                try {
                    ImagenRestaurante imagen = new ImagenRestaurante();
                    imagen.setNombreArchivo(archivo.getOriginalFilename());
                    imagen.setTipo(archivo.getContentType());
                    imagen.setDatos(archivo.getBytes());
                    imagen.setRestaurante(restaurante);
                    restaurante.getImagenesBlob().add(imagen);
                } catch (IOException e) {
                    throw new RuntimeException("Error procesando imagen", e);
                }
            }
        }

        restauranteRepository.save(restaurante);
    }

    public ImagenRestaurante obtenerImagenBlob(Long id) {
        return imagenRestauranteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));
    }

}