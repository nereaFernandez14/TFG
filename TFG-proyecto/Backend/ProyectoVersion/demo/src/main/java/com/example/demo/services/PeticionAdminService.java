package com.example.demo.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.entities.PeticionAdmin;
import com.example.demo.repositories.PeticionAdminRepository;
import com.example.demo.repositories.ResenyaRepository;
import com.example.demo.repositories.RestauranteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PeticionAdminService {

    private final PeticionAdminRepository repo;
    private final RestauranteRepository restauranteRepo;
    private final ResenyaRepository resenyaRepo;

    public List<PeticionAdmin> obtenerPendientes() {
        return repo.findAllByRevisadaIsFalse();
    }

    public void aprobarPeticion(Long id) {
        PeticionAdmin peticion = repo.findById(id).orElseThrow();
        peticion.setRevisada(true);
        peticion.setAprobada(true);

        switch (peticion.getTipo()) {
            case DENUNCIA -> resenyaRepo.deleteById(peticion.getIdResenya());
            case BAJA -> restauranteRepo.deleteById(peticion.getRestauranteId());
            case MODIFICACION -> {
                // Si querés, podés extender y agregar campos nuevos como "nuevoEmail"
            }
        }
        repo.save(peticion);
    }

    public void rechazarPeticion(Long id) {
        PeticionAdmin peticion = repo.findById(id).orElseThrow();
        peticion.setRevisada(true);
        peticion.setAprobada(false);
        repo.save(peticion);
    }
}
