package com.example.demo.controller;

import com.example.demo.entities.Mensaje;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class MensajeController {

    @GetMapping("/mensajes")
    public ResponseEntity<?> obtenerMensajes(HttpSession session) {
        String usuario = (String) session.getAttribute("usuario");

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("No hay sesión activa o ha expirado.");
        }

        List<Mensaje> mensajes = List.of(
                new Mensaje("Hola " + usuario + ", desde el backend 🖥️"),
                new Mensaje("Conexión exitosa con Angular ✔️"));

        return ResponseEntity.ok(mensajes);
    }
}