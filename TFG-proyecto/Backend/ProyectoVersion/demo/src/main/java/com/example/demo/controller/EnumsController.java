package com.example.demo.controller;

import com.example.demo.dto.EnumsDTO;
import com.example.demo.enums.Barrio;
import com.example.demo.enums.RangoPrecio;
import com.example.demo.enums.RestriccionDietetica;
import com.example.demo.enums.TipoCocina;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;

@RestController
@RequestMapping("/enums")
public class EnumsController {

    @GetMapping
    public EnumsDTO getAllEnums() {
        EnumsDTO enumsDTO = new EnumsDTO();
        enumsDTO.setTiposCocina(Arrays.asList(TipoCocina.values()));
        enumsDTO.setBarrios(Arrays.asList(Barrio.values()));
        enumsDTO.setRangosPrecio(Arrays.asList(RangoPrecio.values()));
        enumsDTO.setRestricciones(Arrays.asList(RestriccionDietetica.values()));
        return enumsDTO;
    }
}
