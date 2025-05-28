package com.example.demo.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.exception.DangerException;

@RestController
public class HomeController {

    @GetMapping
    public Map<String, String> root() {
        return Map.of("message", "Backend activo");
    }

    @GetMapping("/home")
    public Map<String, Object> home(Authentication authentication) {
        String username = authentication.getName();

        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        Object principal = authentication.getPrincipal();
        Map<String, Object> detallesAdicionales = Map.of();

        if (principal instanceof UserDetails userDetails) {
            detallesAdicionales = Map.of(
                    "accountNonExpired", userDetails.isAccountNonExpired(),
                    "accountNonLocked", userDetails.isAccountNonLocked(),
                    "credentialsNonExpired", userDetails.isCredentialsNonExpired(),
                    "enabled", userDetails.isEnabled());
        }

        return Map.of(
                "usuario", username,
                "roles", roles,
                "detalles", detallesAdicionales);
    }

    @GetMapping("/test")
    public void test() throws DangerException {
        throw new DangerException("Error de prueba");
    }
}
