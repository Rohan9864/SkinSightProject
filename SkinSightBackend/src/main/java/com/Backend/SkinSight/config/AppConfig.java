package com.Backend.SkinSight.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class AppConfig {

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RestClient restClient(
            @Value("${ml.service.url:http://localhost:8000}")
            String mlServiceUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();

        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setReadTimeout(Duration.ofSeconds(60));

        return RestClient.builder()
                .requestFactory(factory)
                .baseUrl(mlServiceUrl)
                .defaultHeader("Content-Type",
                        "application/json")
                .defaultHeader("Accept",
                        "application/json")
                .build();
    }
}