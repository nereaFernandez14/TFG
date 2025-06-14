package com.example.demo.services;

import com.example.demo.dto.ResenyaDenunciaDTO;
import com.example.demo.dto.RestauranteUpdateRequest;
import com.example.demo.entities.Resenya;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.SolicitudModificacion;
import com.example.demo.entities.SolicitudModificacionUsuario;
import com.example.demo.entities.Usuario;
import com.example.demo.repositories.ResenyaRepository;
import com.example.demo.repositories.RestauranteRepository;
import com.example.demo.repositories.SolicitudModificacionRepository;
import com.example.demo.repositories.SolicitudModificacionUsuarioRepository;
import com.example.demo.repositories.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ResenyaRepository resenyaRepository;
    private final RestauranteRepository restauranteRepository;
    private final UsuarioRepository usuarioRepository;
    private final RestauranteService restauranteService;
    private final NotificacionService notificacionService;
    private final SolicitudModificacionRepository solicitudModificacionRepository;
    private final SolicitudModificacionUsuarioRepository solicitudUsuarioRepository;

    public List<ResenyaDenunciaDTO> obtenerResenyasDenunciadas() {
        return resenyaRepository.findByDenunciadoTrue()
                .stream()
                .map(ResenyaDenunciaDTO::new)
                .collect(Collectors.toList());
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

    public List<SolicitudModificacionUsuario> obtenerSolicitudesModificacionUsuario() {
        return solicitudUsuarioRepository.findAll();
    }

    public SolicitudModificacion obtenerSolicitudRestaurantePorId(Long id) {
        return solicitudModificacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
    }

    public SolicitudModificacionUsuario obtenerSolicitudUsuarioPorId(Long id) {
        return solicitudUsuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
    }

    // ✔️ Resolución para restaurante
    public void resolverModificacionRestaurante(Long id, boolean aceptada) {
        SolicitudModificacion solicitud = obtenerSolicitudRestaurantePorId(id);

        solicitud.setGestionada(true);
        solicitud.setAceptada(aceptada);
        solicitudModificacionRepository.save(solicitud);

        String msg = aceptada
                ? "✅ Tu solicitud de modificación del campo '" + solicitud.getCampo() + "' fue aceptada."
                : "❌ Tu solicitud de modificación del campo '" + solicitud.getCampo() + "' fue rechazada.";

        notificacionService.crear(solicitud.getRestaurante(), msg);
    }

    public void resolverModificacionUsuario(Long id, boolean aceptada) {
        SolicitudModificacionUsuario solicitud = obtenerSolicitudUsuarioPorId(id);

        Usuario usuario = solicitud.getUsuario();

        if (aceptada) {
            switch (solicitud.getCampo().toLowerCase()) {
                case "nombre" -> usuario.setNombre(solicitud.getNuevoValor());
                case "apellidos" -> usuario.setApellidos(solicitud.getNuevoValor());
                case "email" -> usuario.setEmail(solicitud.getNuevoValor());
                default -> throw new IllegalArgumentException("Campo inválido: " + solicitud.getCampo());
            }
            usuarioRepository.save(usuario);
        }

        solicitud.setGestionada(true);
        solicitud.setAceptada(aceptada);
        solicitudUsuarioRepository.save(solicitud);

        String msg = aceptada
                ? "✅ Tu solicitud de modificación del campo '" + solicitud.getCampo() + "' fue aceptada."
                : "❌ Tu solicitud de modificación del campo '" + solicitud.getCampo() + "' fue rechazada.";

        notificacionService.crear(usuario, msg);
    }

    public void actualizarDatosUsuario(Long id, Usuario datosActualizados) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNombre(datosActualizados.getNombre());
        usuario.setEmail(datosActualizados.getEmail());
        usuario.setApellidos(datosActualizados.getApellidos());
        // Agrega aquí los campos que quieras actualizar...

        usuarioRepository.save(usuario);

        // 🔁 Marcar solicitudes como gestionadas
        List<SolicitudModificacionUsuario> solicitudes = solicitudUsuarioRepository.findByUsuarioId(id);
        for (SolicitudModificacionUsuario solicitud : solicitudes) {
            solicitud.setGestionada(true);
        }
        solicitudUsuarioRepository.saveAll(solicitudes);

        notificacionService.crearParaUsuario(usuario, "📌 El administrador ha aplicado los cambios solicitados.");
    }

}