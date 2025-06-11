package com.example.demo.services;

import com.example.demo.dto.RestauranteUpdateRequest;
import com.example.demo.entities.Resenya;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.SolicitudModificacion;
import com.example.demo.entities.Usuario;
import com.example.demo.repositories.ResenyaRepository;
import com.example.demo.repositories.RestauranteRepository;
import com.example.demo.repositories.SolicitudModificacionRepository;
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
    private final RestauranteService restauranteService;
    private final NotificacionService notificacionService;
    private final SolicitudModificacionRepository solicitudModificacionRepository;

    public List<Resenya> obtenerResenyasDenunciadas() {
        return resenyaRepository.findByDenunciadoTrue();
    }

    public void aceptarDenuncia(Long idResenya) {
        Resenya resenya = resenyaRepository.findById(idResenya)
                .orElseThrow(() -> new RuntimeException("Reseña no encontrada"));

        Restaurante restaurante = resenya.getRestaurante();
        resenyaRepository.delete(resenya);
        notificacionService.crearParaRestaurante(
                restaurante, "✅ El administrador ha eliminado una reseña tras tu denuncia.");
    }

    public void rechazarDenuncia(Long idResenya) {
        resenyaRepository.findById(idResenya).ifPresent(res -> {
            res.setDenunciado(false);
            resenyaRepository.save(res);

            Restaurante restaurante = res.getRestaurante();
            notificacionService.crearParaRestaurante(
                    restaurante, "❌ El administrador ha rechazado tu denuncia de reseña.");
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

    public Usuario obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    public void guardarUsuario(Usuario usuario) {
        usuarioRepository.save(usuario);
    }

    public void actualizarDatosRestaurante(Long id, RestauranteUpdateRequest request) {
        Restaurante restaurante = restauranteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurante no encontrado"));

        restauranteService.actualizarDatosRestaurante(id, request);

        notificacionService.crearParaRestaurante(
                restaurante, "📌 El administrador ha aplicado los cambios solicitados en tus datos.");
    }

    public List<SolicitudModificacion> obtenerSolicitudesModificacion() {
        return solicitudModificacionRepository.findAll();
    }
}