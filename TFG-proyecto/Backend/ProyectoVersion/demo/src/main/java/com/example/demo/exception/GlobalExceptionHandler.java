package com.example.demo.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.view.RedirectView;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(DangerException.class)
	public RedirectView danger(HttpSession s, DangerException e) {
		String mensaje = e.getMessage() != null && !e.getMessage().isEmpty() ? e.getMessage().split("@")[0]
				: "Ha ocurrido un error. Pulsa para volver a home";
		String link = e.getMessage() != null && !e.getMessage().isEmpty() && e.getMessage().split("@").length > 1
				? e.getMessage().split("@")[1]
				: "/";

		s.setAttribute("_mensaje", mensaje);
		s.setAttribute("_link", link);
		s.setAttribute("_severity", "danger");

		return new RedirectView("/info");
	}

	@ExceptionHandler(InfoException.class)
	public RedirectView info(HttpSession s, InfoException e) {
		String mensaje = e.getMessage() != null && !e.getMessage().isEmpty() ? e.getMessage().split("@")[0]
				: "Ha ocurrido un error. Pulsa para volver a home";
		String link = e.getMessage() != null && !e.getMessage().isEmpty() && e.getMessage().split("@").length > 1
				? e.getMessage().split("@")[1]
				: "/";

		s.setAttribute("_mensaje", mensaje);
		s.setAttribute("_link", link);
		s.setAttribute("_severity", "info");

		return new RedirectView("/info");
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
		Map<String, String> errores = new HashMap<>();
		ex.getBindingResult().getFieldErrors().forEach(error -> {
			errores.put(error.getField(), error.getDefaultMessage());
		});
		return ResponseEntity.badRequest().body(errores);
	}
}
