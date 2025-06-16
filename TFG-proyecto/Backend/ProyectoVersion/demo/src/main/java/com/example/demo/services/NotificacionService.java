package com.example.demo.services;

import com.example.demo.entities.Notificacion;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.SolicitudModificacion;
import com.example.demo.entities.Usuario;
import com.example.demo.enums.RolNombre;
import com.example.demo.repositories.NotificacionRepository;
import com.example.demo.repositories.RestauranteRepository;
import com.example.demo.repositories.SolicitudModificacionRepository;
import com.example.demo.repositories.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final RestauranteRepository restauranteRepository;
    private final SolicitudModificacionRepository solicitudModificacionRepository;
    private final UsuarioRepository usuarioRepository;

    public void crearParaRestaurante(Restaurante destino, String mensaje) {
        Notificacion noti = new Notificacion();
        noti.setMensaje(mensaje);
        noti.setDestinatarioRestaurante(destino);
        noti.setVista(false);
        noti.setParaAdmin(false);
        noti.setGestionada(false);
        notificacionRepository.save(noti);
    }

    public void crearParaUsuario(Usuario destino, String mensaje) {
        Notificacion noti = new Notificacion();
        noti.setMensaje(mensaje);
        noti.setParaAdmin(false);
        noti.setDestinatarioUsuario(destino);
        noti.setVista(false);
        noti.setGestionada(false);
        notificacionRepository.save(noti);
    }

    public void crearParaAdmin(String mensaje, Restaurante generadoPor) {
        Notificacion noti = new Notificacion();
        noti.setMensaje(mensaje);
        noti.setParaAdmin(true);
        noti.setGeneradaPorRestaurante(generadoPor);
        noti.setVista(false);
        noti.setGestionada(false);

        Usuario admin = usuarioRepository.findFirstByRol(RolNombre.ADMIN)
                .orElseThrow(() -> new IllegalStateException("❌ No hay un admin configurado"));

        noti.setDestinatarioUsuario(admin);
        notificacionRepository.save(noti);
    }

    public void crearParaAdmin(String mensaje, Usuario generadoPor) {
        Notificacion noti = new Notificacion();
        noti.setMensaje(mensaje);
        noti.setParaAdmin(true);
        noti.setGeneradaPorUsuario(generadoPor);
        noti.setVista(false);
        noti.setGestionada(false);

        Usuario admin = usuarioRepository.findFirstByRol(RolNombre.ADMIN)
                .orElseThrow(() -> new IllegalStateException("❌ No hay un admin configurado"));

        noti.setDestinatarioUsuario(admin);

        notificacionRepository.save(noti);
    }

    public void crearParaAdmin(String mensaje) {
        Notificacion noti = new Notificacion();
        noti.setMensaje(mensaje);
        noti.setParaAdmin(true);
        noti.setVista(false);
        noti.setGestionada(false);

        Usuario admin = usuarioRepository.findFirstByRol(RolNombre.ADMIN)
                .orElseThrow(() -> new IllegalStateException("❌ No hay un admin configurado"));

        noti.setDestinatarioUsuario(admin);

        notificacionRepository.save(noti);
    }

    public void marcarComoVista(Long id) {
        Notificacion n = notificacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        n.setVista(true);
        notificacionRepository.save(n);
    }

    public List<Notificacion> obtenerNoVistas(Restaurante restaurante) {
        return notificacionRepository.findByDestinatarioRestauranteAndVistaFalse(restaurante);
    }

    public List<Notificacion> obtenerNoVistas(Usuario usuario) {
        return notificacionRepository.findByDestinatarioUsuarioAndVistaFalse(usuario);
    }

    public List<Notificacion> obtenerTodasParaAdminNoVistas() {
        return notificacionRepository.findByParaAdminTrueAndVistaFalse();
    }

    public void crearSolicitudConNotificacion(Restaurante restaurante, String campo, String nuevoValor) {
        boolean yaExiste = solicitudModificacionRepository
                .existsByRestauranteAndCampoAndNuevoValor(restaurante, campo, nuevoValor);

        if (yaExiste) {
            return;
        }

        SolicitudModificacion solicitud = new SolicitudModificacion();
        solicitud.setCampo(campo);
        solicitud.setNuevoValor(nuevoValor);
        solicitud.setRestaurante(restaurante);
        solicitudModificacionRepository.save(solicitud);

        String msg = "✏️ El restaurante '" + restaurante.getNombre() + "' solicita modificar el campo \"" + campo
                + "\" con valor: '" + nuevoValor + "'";
        crearParaAdmin(msg, restaurante);
    }

    public void crear(Restaurante restaurante, String mensaje) {
        crearParaRestaurante(restaurante, mensaje);
    }

    public void crear(Usuario usuario, String mensaje) {
        crearParaUsuario(usuario, mensaje);
    }
}