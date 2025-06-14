package com.example.demo.services;

import com.example.demo.dto.ChangePasswordRequest;
import com.example.demo.entities.Usuario;
import com.example.demo.exception.DangerException;
import com.example.demo.repositories.UsuarioRepository;
import com.example.helper.PRG;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final List<String> PALABRAS_PROHIBIDAS = List.of(
            "puta", "mierda", "gilipollas", "imbécil", "estúpido" // puedes ampliar la lista
    );

    public void setRegistro(String email) throws DangerException {
        Optional<Usuario> optionalUsuario = usuarioRepository.findByEmail(email);
        if (optionalUsuario.isPresent()) {
            Usuario usuario = optionalUsuario.get();
            usuario.setEstaRegistrado(true);
            usuarioRepository.save(usuario);
        } else {
            PRG.error("El usuario con email " + email + " no existe");
        }
    }

    public boolean isUsuarioRegistrado(String email) {
        return usuarioRepository.findByEmail(email)
                .map(Usuario::isEstaRegistrado)
                .orElse(false);
    }

    public String obtenerNombrePorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .map(Usuario::getNombre)
                .orElse("Usuario");
    }

    public Long obtenerIdPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .map(Usuario::getId)
                .orElse(null);
    }

    public Usuario obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email).orElse(null);
    }

    public void setLogout(String email) {
        System.out.println("📤 Logout registrado para el usuario: " + email);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), usuario.getPassword())) {
            throw new IllegalArgumentException("La contraseña actual es incorrecta");
        }

        if (passwordEncoder.matches(request.getNewPassword(), usuario.getPassword())) {
            throw new IllegalArgumentException("La nueva contraseña no puede ser igual a la actual");
        }

        usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
        usuarioRepository.save(usuario);
    }

    /*
     * public void marcarSolicitudDeBaja(Long id) {
     * Usuario usuario = usuarioRepository.findById(id)
     * .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
     * usuario.setSolicitaBaja(true);
     * usuarioRepository.save(usuario);
     * }
     */

    public void registrarUsuario(Usuario usuario) throws DangerException {
        // Email ya registrado
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new DangerException("El usuario ya está registrado con ese email");
        }

        // Validar email
        if (!usuario.getEmail().matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
            throw new DangerException("El email tiene un formato inválido");
        }

        // Validar nombre/apellidos sin insultos
        String nombreCompleto = (usuario.getNombre() + " " + usuario.getApellidos()).toLowerCase();
        for (String palabra : PALABRAS_PROHIBIDAS) {
            if (nombreCompleto.contains(palabra)) {
                throw new DangerException("Nombre o apellidos contienen palabras no permitidas");
            }
        }

        // Validar longitud de contraseña
        if (usuario.getPassword() == null || usuario.getPassword().length() < 6) {
            throw new DangerException("La contraseña debe tener al menos 6 caracteres");
        }

        // Encriptar y guardar
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        usuario.setEstaRegistrado(true);
        usuarioRepository.save(usuario);
    }

}