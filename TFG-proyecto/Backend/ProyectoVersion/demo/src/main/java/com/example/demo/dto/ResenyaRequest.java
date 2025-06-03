package com.example.demo.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ResenyaRequest {
  private String contenido;
  private Integer valoracion;
  private Long restauranteId;
  private MultipartFile[] imagenes;
}
