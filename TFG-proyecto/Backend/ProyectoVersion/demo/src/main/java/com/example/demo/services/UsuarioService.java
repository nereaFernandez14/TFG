package com.example.demo.services;

import com.example.demo.entities.ChangePasswordRequest;
import com.example.demo.entities.Usuario;
import com.example.demo.exception.DangerException;
import com.example.demo.repositories.UsuarioRepository;
import com.example.helper.PRG;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

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

        usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
        usuarioRepository.save(usuario);
    }
}