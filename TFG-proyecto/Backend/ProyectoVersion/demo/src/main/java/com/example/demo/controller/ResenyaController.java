package com.example.demo.controller;

import com.example.demo.entities.Resenya;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.Usuario;
import com.example.demo.repositories.ResenyaRepository;
import com.example.demo.repositories.RestauranteRepository;
import com.example.demo.repositories.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/resenyas")
public class ResenyaController {

    @Autowired
    private ResenyaRepository resenyaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RestauranteRepository restauranteRepository;

    @PostMapping
    public Resenya crearResenya(@RequestParam Long idCliente,
                                      @RequestParam Long idRestaurante,
                                      @RequestBody String contenido) {

        Usuario cliente = usuarioRepository.findById(idCliente).orElseThrow();  //Si no existe el cliente, lanzará una excepción
        Restaurante restaurante = restauranteRepository.findById(idRestaurante).orElseThrow(); //Si no existe el restaurante, lanzará una excepción

        Resenya resenya = new Resenya();
        resenya.setAutor(cliente);
        resenya.setRestaurante(restaurante);
        resenya.setContenido(contenido);

        return resenyaRepository.save(resenya);
    }

    @GetMapping
    public List<Resenya> getAllResenyas() {
        return resenyaRepository.findAll();
    }

    //Obtener Resenyas del restaurante actual 
    @GetMapping("/mios")
    public List<Resenya> getMisresenyas(@RequestParam Long idUsuarioRestaurante) {
        // Buscar restaurante por usuario
        Restaurante restaurante = restauranteRepository.findByUsuarioId(idUsuarioRestaurante);
        return resenyaRepository.findByRestaurante(restaurante);
    }
}
