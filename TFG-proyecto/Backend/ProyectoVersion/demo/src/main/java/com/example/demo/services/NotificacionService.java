package com.example.demo.services;

import com.example.demo.entities.Notificacion;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.SolicitudModificacion;
import com.example.demo.repositories.NotificacionRepository;
import com.example.demo.repositories.RestauranteRepository;
import com.example.demo.repositories.SolicitudModificacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final RestauranteRepository restauranteRepository;
    private final SolicitudModificacionRepository solicitudModificacionRepository;

    // 🔔 Notificación dirigida a un restaurante específico
    public void crearParaRestaurante(Restaurante destino, String mensaje) {
        Notificacion noti = new Notificacion();
        noti.setMensaje(mensaje);
        noti.setDestinatarioRestaurante(destino);
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

    // 🔍 Todas las no vistas para el admin
    public List<Notificacion> obtenerTodasParaAdminNoVistas() {
        return notificacionRepository.findByParaAdminTrueAndVistaFalse();
    }

    // 🛠️ Solicitud de modificación + notificación al admin
    public void crearSolicitudConNotificacion(Restaurante restaurante, String campo, String nuevoValor) {
        boolean yaExiste = solicitudModificacionRepository
                .existsByRestauranteAndCampoAndNuevoValor(restaurante, campo, nuevoValor);

        if (yaExiste) {
            // Ya se solicitó esta misma modificación antes, no duplicar
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

    // Alias: por compatibilidad o conveniencia
    public void crear(Restaurante restaurante, String mensaje) {
        crearParaRestaurante(restaurante, mensaje);
    }
}