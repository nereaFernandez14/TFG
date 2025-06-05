package com.example.demo.config;

import jakarta.servlet.Filter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.PrintWriter;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf
                                                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                                                .ignoringRequestMatchers(
                                                                "/register",
                                                                "/api/register",
                                                                "/api/login",
                                                                "/api/logout",
                                                                "/api/rol",
                                                                "/api/sesion",
                                                                "/restaurantes/buscar",
                                                                "/restaurantes/**",
                                                                "/resenyas/**",
                                                                "/roles",
                                                                "/change-password"))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                .requestMatchers(
                                                                "/register",
                                                                "/api/register",
                                                                "/api/csrf",
                                                                "/api/login",
                                                                "/api/logout",
                                                                "/api/rol",
                                                                "/api/sesion",
                                                                "/restaurantes/buscar",
                                                                "/roles",
                                                                "/change-password",
                                                                "/error",
                                                                "/restaurantes/filtrar-avanzado",
                                                                "/restaurantes/**",
                                                                "/resenyas/**",
                                                                "/restaurantes/menus/**"
                                                ).permitAll()
                                                .requestMatchers(HttpMethod.POST, "/resenyas").hasRole("USUARIO") // ✅
                                                                                                                  // Mantiene
                                                                                                                  // lógica
                                                                                                                  // de
                                                                                                                  // seguridad
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.ALWAYS))
                                .formLogin(form -> form.disable())
                                .httpBasic(httpBasic -> httpBasic.disable())
                                .logout(logout -> logout
                                                .logoutUrl("/api/logout")
                                                .invalidateHttpSession(true)
                                                .deleteCookies("JSESSIONID", "XSRF-TOKEN")
                                                .logoutSuccessHandler((request, response, authentication) -> {
                                                        response.setStatus(HttpServletResponse.SC_OK);
                                                        response.setContentType("application/json");
                                                        PrintWriter writer = response.getWriter();
                                                        writer.write("{\"message\": \"Logout exitoso\"}");
                                                        writer.flush();
                                                }));

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("https://localhost:4200"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "X-XSRF-TOKEN"));
                config.setExposedHeaders(List.of("Authorization", "X-XSRF-TOKEN", "Set-Cookie"));
                config.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
                return authConfig.getAuthenticationManager();
        }

        @Bean
        public FilterRegistrationBean<Filter> logRequestFilter() {
                FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>();
                registration.setFilter((request, response, chain) -> {
                        HttpServletRequest req = (HttpServletRequest) request;
                        System.out.println("🛸 Melody interceptó: " + req.getMethod() + " " + req.getRequestURI());
                        System.out.println("🛰️ Origin: " + req.getHeader("Origin"));
                        System.out.println("🍪 Cookie: " + req.getHeader("Cookie"));
                        chain.doFilter(request, response);
                });
                registration.setOrder(1);
                return registration;
        }
}