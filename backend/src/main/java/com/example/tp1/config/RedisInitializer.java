package com.example.tp1.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

import java.nio.charset.StandardCharsets;

@Configuration
public class RedisInitializer {
    private static final Logger logger = LoggerFactory.getLogger(RedisInitializer.class);

    /**
     * CommandLineRunner para comprobar la conexión a Redis al iniciar la app y opcionalmente
     * insertar un usuario de prueba en la clave `user:demo` si no existe.
     *
     * Explica cómo Redis se integra:
     * - Spring Boot auto-configura un RedisConnectionFactory tomando host/port de application.properties
     * - RedisTemplate<String,String> (configurado en RedisConfig) usa esa fábrica para operaciones K/V
     * - Aquí hacemos una verificación ping y creamos `user:demo` -> `password123` si hace falta
     */
    @Bean
    public CommandLineRunner redisCheck(RedisConnectionFactory connectionFactory, RedisTemplate<String, String> redisTemplate) {
        return args -> {
            try {
                RedisConnection conn = connectionFactory.getConnection();

                String pong = conn.ping();

// Line 33: Simplified log (no need for new String(pong, ...))
                String pongStr = (pong != null) ? pong : "(no response)";
                logger.info("Redis PING response: {}", pongStr);

                // seed a demo user if not present
                String userKey = "user:demo";
                String existing = redisTemplate.opsForValue().get(userKey);
                if (existing == null) {
                    redisTemplate.opsForValue().set(userKey, "password123");
                    logger.info("Seeded Redis test user -> key='{}' value='{}'", userKey, "password123");
                } else {
                    logger.info("Redis test user already present (key='{}')", userKey);
                }
            } catch (Exception ex) {
                logger.error("Error connecting to Redis: {}", ex.getMessage());
            }
        };
    }
}
