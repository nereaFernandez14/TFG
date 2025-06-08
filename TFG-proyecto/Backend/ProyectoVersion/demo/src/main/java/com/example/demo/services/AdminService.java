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
public class AdminService {

    private final ResenyaRepository resenyaRepository;
    private final RestauranteRepository restauranteRepository;
    private final UsuarioRepository usuarioRepository;

    public List<Resenya> obtenerResenyasDenunciadas() {
        return resenyaRepository.findByDenunciadoTrue();
    }

    public void aceptarDenuncia(Long idResenya) {
        resenyaRepository.deleteById(idResenya);
    }

    public void rechazarDenuncia(Long idResenya) {
        resenyaRepository.findById(idResenya).ifPresent(res -> {
            res.setDenunciado(false);
            resenyaRepository.save(res);
        });
    }

    public List<Restaurante> obtenerRestaurantesParaBaja() {
        return restauranteRepository.findBySolicitaBajaTrue();
    }

    public void eliminarRestaurante(Long id) {
        Restaurante restaurante = restauranteRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Restaurante no encontrado"));
        restauranteRepository.delete(restaurante);
    }
    
    public List<Usuario> obtenerUsuariosParaBaja() {
        return usuarioRepository.findBySolicitaBajaTrue();
    }

    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }
}
