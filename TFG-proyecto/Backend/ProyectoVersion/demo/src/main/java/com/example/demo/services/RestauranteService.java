package com.example.demo.services;

import com.example.demo.entities.Restaurante;
import com.example.demo.entities.Usuario;
import com.example.demo.repositories.RestauranteRepository;
import com.example.demo.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RestauranteService {

    @Autowired
    private RestauranteRepository restauranteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Método para crear un restaurante y asignarle un dueño (usuario)
    public Restaurante crearRestaurante(Long idUsuario, Restaurante restaurante) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        restaurante.setUsuario(usuario);
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
}

