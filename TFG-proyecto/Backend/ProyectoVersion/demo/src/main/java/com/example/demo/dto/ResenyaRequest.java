package com.example.demo.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ResenyaRequest {
  private Long restauranteId;
  private String contenido;
  private int valoracion;
  private MultipartFile[] imagenes;
}
