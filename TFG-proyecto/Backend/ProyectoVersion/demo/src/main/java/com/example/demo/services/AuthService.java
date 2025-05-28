package com.example.demo.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.entities.Rol;
import com.example.demo.entities.Usuario;
import com.example.demo.repositories.UsuarioRepository;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean validateUser(String email, String rawPassword) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        return usuarioOpt
                .map(usuario -> passwordEncoder.matches(rawPassword, usuario.getPassword()))
                .orElse(false);
    }

    public Rol obtenerRol(String username) {
        return usuarioRepository.findByEmail(username)
                .map(Usuario::getRol)
                .orElseGet(() -> {
                    Rol rol = new Rol();
                    rol.setNombre("UNKNOWN");
                    return rol;
                });
    }
}