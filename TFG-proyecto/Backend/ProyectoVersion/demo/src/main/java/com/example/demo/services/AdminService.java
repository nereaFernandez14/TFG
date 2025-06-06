package com.example.demo.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.entities.Resenya;
import com.example.demo.entities.Restaurante;
import com.example.demo.repositories.ResenyaRepository;
import com.example.demo.repositories.RestauranteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final RestauranteRepository restauranteRepository;
    private final ResenyaRepository resenyaRepository;

    public List<Resenya> obtenerResenyasOfensivas(Long restauranteId) {
        return resenyaRepository.findByRestauranteIdAndOfensivoTrue(restauranteId);
    }

    public void eliminarResenya(Long resenyaId) {
        resenyaRepository.deleteById(resenyaId);
    }

    public Restaurante modificarDatosRestaurante(Long id, String direccion, String email, String telefono) {
        Restaurante restaurante = restauranteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurante no encontrado"));

        restaurante.setDireccion(direccion);
        restaurante.setEmail(email);
        restaurante.setTelefono(telefono);

        return restauranteRepository.save(restaurante);
    }

    public void eliminarRestaurante(Long restauranteId) {
        restauranteRepository.deleteById(restauranteId);
    }

    public List<Restaurante> listarRestaurantesConSolicitudBaja() {
        return restauranteRepository.findAll().stream()
                .filter(r -> r.getNombre().toLowerCase().contains("baja")) // ❗ TEMPORAL: cambia por campo explícito si
                                                                           // lo agregás
                .collect(Collectors.toList());
    }
}
