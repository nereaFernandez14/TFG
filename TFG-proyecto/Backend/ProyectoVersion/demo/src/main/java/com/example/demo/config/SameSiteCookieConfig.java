package com.example.demo.config;

import org.springframework.boot.web.servlet.server.CookieSameSiteSupplier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SameSiteCookieConfig {

    @Bean
    public List<CookieSameSiteSupplier> sameSiteSuppliers() {
        return List.of(
                CookieSameSiteSupplier.ofNone().whenHasName("JSESSIONID"),
                CookieSameSiteSupplier.ofNone().whenHasName("XSRF-TOKEN"));
    }
}