package com.example.demo.controller;

import com.example.demo.entities.LoginRequest;
import com.example.demo.entities.Rol;
import com.example.demo.services.AuthService;
import com.example.demo.services.UsuarioService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@CrossOrigin(origins = "https://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("/api")
public class LoginController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UsuarioService usuarioService;

    // ✅ Endpoint para preparar la sesión y el token CSRF
    @GetMapping("/sesion")
    public ResponseEntity<?> prepararSesion(HttpSession session) {
        return ResponseEntity.ok(Map.of("mensaje", "Sesión iniciada"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest, HttpSession session) {
        System.out.println("🔥 Intento de login: " + loginRequest.getUsername());

        try {
            boolean isValid = authService.validateUser(loginRequest.getUsername(), loginRequest.getPassword());

            if (!isValid) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Credenciales inválidas"));
            }

            if (!usuarioService.isUsuarioRegistrado(loginRequest.getUsername())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Tu cuenta aún no está activada"));
            }

            Rol rol = authService.obtenerRol(loginRequest.getUsername());

            // 🔍 Aquí asumimos que puedes obtener el nombre del usuario desde el servicio
            String nombre = usuarioService.obtenerNombrePorEmail(loginRequest.getUsername());

            session.setAttribute("usuario", loginRequest.getUsername());
            session.setAttribute("rol", rol);

            GrantedAuthority authority = (GrantedAuthority) () -> "ROLE_" + rol.getNombre();
            User userDetails = new User(loginRequest.getUsername(), "", Collections.singletonList(authority));
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails,
                    null, userDetails.getAuthorities());

            SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
            securityContext.setAuthentication(authentication);
            SecurityContextHolder.setContext(securityContext);
            session.setAttribute("SPRING_SECURITY_CONTEXT", securityContext);

            System.out.println("✅ Login correcto para: " + loginRequest.getUsername() + " con rol " + rol.getNombre());

            return ResponseEntity.ok(Map.of(
                    "message", "Login exitoso",
                    "role", rol.getNombre(),
                    "email", loginRequest.getUsername(),
                    "nombre", nombre));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno: " + ex.getMessage()));
        }
    }

    @GetMapping("/rol")
    public ResponseEntity<?> getRol(HttpSession session) {
        Rol rol = (Rol) session.getAttribute("rol");
        String email = (String) session.getAttribute("usuario");

        if (rol != null) {
            String nombre = usuarioService.obtenerNombrePorEmail(email);
            return ResponseEntity.ok(Map.of("role", rol.getNombre(), "nombre", nombre));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session, HttpServletResponse response) {
        // Recuperamos el nombre del usuario antes de invalidar la sesión
        String email = (String) session.getAttribute("usuario");

        // Log de logout (si aplica lógica adicional, como actualizar BD o logs)
        if (email != null) {
            usuarioService.setLogout(email); // Puedes registrar que el usuario se desconectó
        }

        // Limpiar sesión y contexto de seguridad
        session.invalidate();
        SecurityContextHolder.clearContext();

        // Limpiar cookies de sesión
        Cookie jsessionCookie = new Cookie("JSESSIONID", null);
        jsessionCookie.setPath("/");
        jsessionCookie.setMaxAge(0);
        jsessionCookie.setHttpOnly(true);
        jsessionCookie.setSecure(true);
        response.addCookie(jsessionCookie);

        // Limpiar token CSRF si se usó
        Cookie csrfCookie = new Cookie("XSRF-TOKEN", null);
        csrfCookie.setPath("/");
        csrfCookie.setMaxAge(0);
        csrfCookie.setHttpOnly(false);
        csrfCookie.setSecure(true);
        response.addCookie(csrfCookie);

        return ResponseEntity.ok(Map.of("message", "Logout exitoso"));
    }
    @GetMapping("/csrf")
    public Map<String, String> getCsrfToken(CsrfToken token) {
        // ✅ Al devolver el token, Spring lo inicializa y envía la cookie automáticamente
        return Map.of("token", token.getToken());
    }



}