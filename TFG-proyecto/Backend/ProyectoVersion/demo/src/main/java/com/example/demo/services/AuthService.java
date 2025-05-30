package com.example.demo.services;

import com.example.demo.entities.Usuario;
import com.example.demo.enums.RolNombre;
import com.example.demo.repositories.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

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

    public RolNombre obtenerRolEnum(String email) {
        return usuarioRepository.findByEmail(email)
                .map(Usuario::getRol)
                .orElse(RolNombre.USUARIO); // Puedes cambiar el valor por defecto si prefieres lanzar una excepción
    }
}