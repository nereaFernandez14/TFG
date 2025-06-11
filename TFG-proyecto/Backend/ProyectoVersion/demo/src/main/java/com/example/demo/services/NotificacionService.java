package com.example.demo.services;

import com.example.demo.entities.Notificacion;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.SolicitudModificacion;
import com.example.demo.entities.SolicitudModificacionUsuario;
import com.example.demo.entities.Usuario;
import com.example.demo.repositories.NotificacionRepository;
import com.example.demo.repositories.RestauranteRepository;
import com.example.demo.repositories.SolicitudModificacionRepository;
import com.example.demo.repositories.SolicitudModificacionUsuarioRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final RestauranteRepository restauranteRepository;
    private final SolicitudModificacionRepository solicitudModificacionRepository;
    private final SolicitudModificacionUsuarioRepository solicitudModificacionUsuarioRepository;

    // 🔔 Notificación dirigida a un restaurante específico
    public void crearParaRestaurante(Restaurante destino, String mensaje) {
        Notificacion noti = new Notificacion();
        noti.setMensaje(mensaje);
        noti.setDestinatarioRestaurante(destino);
        noti.setVista(false);
        noti.setParaAdmin(false);
        notificacionRepository.save(noti);
    }

    // 🔔 Notificación dirigida a un usuario específico
    public void crearParaUsuario(Usuario usuario, String mensaje) {
        Notificacion noti = new Notificacion();
        noti.setMensaje(mensaje);
        noti.setDestinatarioUsuario(usuario);
        noti.setVista(false);
        noti.setParaAdmin(false);
        notificacionRepository.save(noti);
    }

    // 🔔 Notificación para el admin desde un restaurante
    public void crearParaAdmin(String mensaje, Restaurante generadoPor) {
        Notificacion noti = new Notificacion();
        noti.setMensaje(mensaje);
        noti.setParaAdmin(true);
        noti.setGeneradaPorRestaurante(generadoPor);
        noti.setVista(false);
        notificacionRepository.save(noti);
    }

    // 🔔 Notificación para el admin desde un usuario
    public void crearParaAdmin(String mensaje, Usuario generadoPor) {
        Notificacion noti = new Notificacion();
        noti.setMensaje(mensaje);
        noti.setParaAdmin(true);
        noti.setGeneradaPorUsuario(generadoPor);
        noti.setVista(false);
        notificacionRepository.save(noti);
    }

    // 🔔 Notificación para el admin sin origen
    public void crearParaAdmin(String mensaje) {
        Notificacion noti = new Notificacion();
        noti.setMensaje(mensaje);
        noti.setParaAdmin(true);
        noti.setVista(false);
        notificacionRepository.save(noti);
    }

    // 🔁 Marcar una notificación como vista
    public void marcarComoVista(Long id) {
        Notificacion n = notificacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        n.setVista(true);
        notificacionRepository.save(n);
    }

    // 🔍 Todas las no vistas para un restaurante
    public List<Notificacion> obtenerNoVistas(Restaurante restaurante) {
        return notificacionRepository.findByDestinatarioRestauranteAndVistaFalse(restaurante);
    }

    // 🔍 Todas las no vistas para un usuario
    public List<Notificacion> obtenerNoVistas(Usuario usuario) {
        return notificacionRepository.findByDestinatarioUsuarioAndVistaFalse(usuario);
    }

    // 🔍 Todas las no vistas para el admin
    public List<Notificacion> obtenerTodasParaAdminNoVistas() {
        return notificacionRepository.findByParaAdminTrueAndVistaFalse();
    }

    // 🛠️ Solicitud de modificación + notificación al admin desde restaurante
    public void crearSolicitudConNotificacion(Restaurante restaurante, String campo, String nuevoValor) {
        boolean yaExiste = solicitudModificacionRepository
                .existsByRestauranteAndCampoAndNuevoValor(restaurante, campo, nuevoValor);

        if (yaExiste)
            return;

        SolicitudModificacion solicitud = new SolicitudModificacion();
        solicitud.setCampo(campo);
        solicitud.setNuevoValor(nuevoValor);
        solicitud.setRestaurante(restaurante);
        solicitudModificacionRepository.save(solicitud);

        String msg = "✏️ El restaurante '" + restaurante.getNombre() + "' solicita modificar el campo \"" + campo
                + "\" con valor: '" + nuevoValor + "'";
        crearParaAdmin(msg, restaurante);
    }

    // 🛠️ Solicitud de modificación + notificación al admin desde usuario
    public void crearSolicitudUsuarioConNotificacion(Usuario usuario, String campo, String nuevoValor) {
        boolean yaExiste = solicitudModificacionUsuarioRepository
                .existsByUsuarioAndCampoAndNuevoValor(usuario, campo, nuevoValor);

        if (yaExiste)
            return;

        SolicitudModificacionUsuario solicitud = new SolicitudModificacionUsuario();
        solicitud.setCampo(campo);
        solicitud.setNuevoValor(nuevoValor);
        solicitud.setUsuario(usuario);
        solicitudModificacionUsuarioRepository.save(solicitud);

        String msg = "✏️ El usuario '" + usuario.getNombre() + "' solicita modificar el campo \"" + campo
                + "\" con valor: '" + nuevoValor + "'";
        crearParaAdmin(msg, usuario);
    }

    // Alias para restaurante
    public void crear(Restaurante restaurante, String mensaje) {
        crearParaRestaurante(restaurante, mensaje);
    }

    // Alias para usuario
    public void crear(Usuario usuario, String mensaje) {
        crearParaUsuario(usuario, mensaje);
    }
}
