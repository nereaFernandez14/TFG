package com.example.demo.services;

import com.example.demo.entities.Resenya;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.Usuario;
import com.example.demo.repositories.ResenyaRepository;
import com.example.demo.repositories.RestauranteRepository;
import com.example.demo.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResenyaService {

    @Autowired
    private ResenyaRepository comentarioRepository;

    @Autowired 
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RestauranteRepository restauranteRepository;

    // Método para crear un nuevo comentario
    public Resenya crearComentario(Long idCliente, Long idRestaurante, String contenido) {
        // Buscar al usuario (cliente) y al restaurante
        Usuario cliente = usuarioRepository.findById(idCliente).orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        Restaurante restaurante = restauranteRepository.findById(idRestaurante).orElseThrow(() -> new RuntimeException("Restaurante no encontrado"));

        Resenya comentario = new Resenya();
        comentario.setAutor(cliente);
        comentario.setRestaurante(restaurante);
        comentario.setContenido(contenido);

        return comentarioRepository.save(comentario);
    }

    public List<Resenya> obtenerTodosLosComentarios() {
        return comentarioRepository.findAll();
    }

    public List<Resenya> obtenerComentariosDeRestaurante(Long idRestaurante) {
        Restaurante restaurante = restauranteRepository.findById(idRestaurante).orElseThrow(() -> new RuntimeException("Restaurante no encontrado"));
        return comentarioRepository.findByRestaurante(restaurante);
    }
}
