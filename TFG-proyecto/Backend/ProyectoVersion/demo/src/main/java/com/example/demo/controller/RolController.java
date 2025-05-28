package com.example.demo.controller;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entities.Rol;
import com.example.demo.repositories.RolRepository;

@RestController
@CrossOrigin(origins = "https://localhost:4200", allowCredentials = "true")
public class RolController {

    @Autowired
    private RolRepository rolRepository;

    @GetMapping("/roles")
    public List<Map<String, Object>> obtenerRolesSinAdmin() {
        return rolRepository.findAll().stream()
                .filter(rol -> {
                    String nombre = rol.getNombre();
                    return nombre != null && !nombre.trim().equalsIgnoreCase("admin")
                            && !nombre.trim().equalsIgnoreCase("administrador");
                })
                .sorted(Comparator.comparing(rol -> rol.getNombre().toLowerCase()))
                .map(rol -> {
                    Map<String, Object> simpleMap = new HashMap<>();
                    simpleMap.put("id", rol.getId());
                    simpleMap.put("nombre", rol.getNombre());
                    return simpleMap;
                })
                .toList();
    }
}