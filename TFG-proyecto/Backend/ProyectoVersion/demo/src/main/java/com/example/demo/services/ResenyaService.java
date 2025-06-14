package com.example.demo.services;

import com.example.demo.dto.ImagenResenyaResponse;
import com.example.demo.dto.ResenyaResponse;
import com.example.demo.entities.ImagenResenya;
import com.example.demo.entities.Resenya;
import com.example.demo.entities.Restaurante;
import com.example.demo.entities.Usuario;
import com.example.demo.repositories.ImagenResenyaRepository;
import com.example.demo.repositories.ResenyaRepository;
import com.example.demo.repositories.RestauranteRepository;
import com.example.demo.repositories.UsuarioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResenyaService {

    private final ResenyaRepository resenyaRepository;
    private final RestauranteRepository restauranteRepository;
    private final UsuarioRepository usuarioRepository;
    private final ImagenResenyaRepository imagenResenyaRepository;

    private static final List<String> PALABRAS_PROHIBIDAS = List.of("tonto", "gilipollas", "idiota");

    @Transactional
    public Resenya guardarResenya(String contenido, int valoracion, Long restauranteId, String email,
            MultipartFile[] imagenes) {

        Usuario autor = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Restaurante restaurante = restauranteRepository.findById(restauranteId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurante no encontrado"));

        if (resenyaRepository.findByAutorAndRestaurante(autor, restaurante).isPresent()) {
            throw new IllegalStateException("Ya has reseñado este restaurante.");
        }

        validarContenido(contenido);

        Resenya resenya = new Resenya(contenido, valoracion, autor, restaurante);
        List<ImagenResenya> imagenEntities = new ArrayList<>();

        if (imagenes != null && imagenes.length > 0) {
            for (MultipartFile imagen : imagenes) {
                if (!imagen.isEmpty()) {
                    try {
                        ImagenResenya img = new ImagenResenya();
                        img.setResenya(resenya);
                        img.setNombreArchivo(imagen.getOriginalFilename());
                        img.setTipo(imagen.getContentType());
                        img.setDatos(imagen.getBytes()); // Guardar como BLOB
                        imagenEntities.add(img);
                    } catch (IOException e) {
                        throw new IllegalStateException("Error guardando imagen: " + imagen.getOriginalFilename(), e);
                    }
                }
            }
        }

        resenya.setImagenes(imagenEntities);
        return resenyaRepository.save(resenya);
    }

    @Transactional
    public Resenya actualizarResenya(Long restauranteId, String email, String contenido,
            MultipartFile[] nuevasImagenes) {
        Usuario autor = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        Restaurante restaurante = restauranteRepository.findById(restauranteId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurante no encontrado"));

        Resenya existente = resenyaRepository.findByAutorAndRestaurante(autor, restaurante)
                .orElseThrow(() -> new IllegalArgumentException("No tienes una reseña para este restaurante"));

        validarContenido(contenido);
        existente.setContenido(contenido);

        if (nuevasImagenes != null && nuevasImagenes.length > 0) {
            List<ImagenResenya> nuevas = new ArrayList<>();

            for (MultipartFile imagen : nuevasImagenes) {
                if (!imagen.isEmpty()) {
                    try {
                        ImagenResenya img = new ImagenResenya();
                        img.setResenya(existente);
                        img.setNombreArchivo(imagen.getOriginalFilename());
                        img.setTipo(imagen.getContentType());
                        img.setDatos(imagen.getBytes()); // Guardar como BLOB
                        nuevas.add(img);
                    } catch (IOException e) {
                        throw new IllegalStateException("Error guardando imagen: " + imagen.getOriginalFilename(), e);
                    }
                }
            }

            existente.getImagenes().clear();
            existente.getImagenes().addAll(nuevas);
        }

        return resenyaRepository.save(existente);
    }

    public List<ResenyaResponse> obtenerResenyasPorRestaurante(Long restauranteId) {
        List<Resenya> resenyas = resenyaRepository.findByRestauranteId(restauranteId);

        return resenyas.stream().map(resenya -> {
            ResenyaResponse dto = new ResenyaResponse();
            dto.setId(resenya.getId());
            dto.setContenido(resenya.getContenido());
            dto.setValoracion(resenya.getValoracion());
            dto.setAutorEmail(resenya.getAutor().getEmail());

            List<ImagenResenyaResponse> imagenes = resenya.getImagenes().stream().map(img -> {
                ImagenResenyaResponse ir = new ImagenResenyaResponse();
                ir.setId(img.getId());
                ir.setNombreArchivo(img.getNombreArchivo());
                return ir;
            }).collect(Collectors.toList());

            dto.setImagenes(imagenes);
            return dto;
        }).collect(Collectors.toList());
    }

    public boolean usuarioYaHaResenyado(Long restauranteId, String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Restaurante restaurante = restauranteRepository.findById(restauranteId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurante no encontrado"));

        return resenyaRepository.findByAutorAndRestaurante(usuario, restaurante).isPresent();
    }

    public ImagenResenya obtenerImagenPorId(Long id) {
        return imagenResenyaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Imagen no encontrada"));
    }

    private void validarContenido(String contenido) {
        if (contenido == null)
            return;

        for (String palabra : PALABRAS_PROHIBIDAS) {
            if (contenido.toLowerCase().contains(palabra)) {
                throw new IllegalArgumentException("El comentario contiene palabras inapropiadas.");
            }
        }
    }

    public void enviarDenunciaAlAdmin(Long resenyaId) {
        Resenya resenya = resenyaRepository.findById(resenyaId)
                .orElseThrow(() -> new RuntimeException("Reseña no encontrada"));

        System.out.println("📢 Denuncia enviada al admin sobre la reseña: " + resenya.getContenido());
    }

    public Optional<Resenya> obtenerPorId(Long id) {
        return resenyaRepository.findById(id);
    }

    public Resenya guardar(Resenya resenya) {
        return resenyaRepository.save(resenya);
    }

    @Transactional
    public void borrarResenya(Long id, String email) {
        Resenya resenya = resenyaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reseña no encontrada"));

        if (!resenya.getAutor().getEmail().equalsIgnoreCase(email)) {
            throw new IllegalArgumentException("No puedes eliminar esta reseña");
        }

        resenyaRepository.delete(resenya); // Cascade ALL borrará las imágenes asociadas
    }

    @Transactional
    public void borrarImagen(Long imagenId, String email) {
        ImagenResenya imagen = imagenResenyaRepository.findById(imagenId)
                .orElseThrow(() -> new IllegalArgumentException("Imagen no encontrada"));

        Resenya resenya = imagen.getResenya();

        if (!resenya.getAutor().getEmail().equalsIgnoreCase(email)) {
            throw new IllegalArgumentException("No puedes eliminar esta imagen");
        }

        imagenResenyaRepository.delete(imagen);
    }

    @Transactional
    public boolean borrarContenidoResenya(Long id) {
        Optional<Resenya> optional = resenyaRepository.findById(id);
        if (optional.isEmpty())
            return false;

        Resenya resenya = optional.get();
        resenya.setContenido(null);
        resenyaRepository.save(resenya);
        return true;
    }
}