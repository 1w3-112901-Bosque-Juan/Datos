package com.example.tp1.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
public class AuthService {
    private final RedisTemplate<String, String> redisTemplate;
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

    public AuthService(RedisTemplate<String, String> redisTemplate) { this.redisTemplate = redisTemplate; }

    // Validate credentials against Redis key pattern: user:{username} -> passwordOrHash
    // Supports legacy plaintext values by performing opportunistic re-hash on successful login.
    public String login(String username, String password) {
        String key = String.format("user:%s", username);
        String stored = redisTemplate.opsForValue().get(key);
        if (stored == null) return null;

        boolean looksLikeBcrypt = stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$");

        if (looksLikeBcrypt) {
            if (bcrypt.matches(password, stored)) {
                return createSessionFor(username);
            }
            return null;
        } else {
            // legacy plaintext password in Redis: compare directly and re-hash on success
            if (stored.equals(password)) {
                // re-hash and replace stored value with bcrypt hash
                String hashed = bcrypt.encode(password);
                redisTemplate.opsForValue().set(key, hashed);
                return createSessionFor(username);
            }
            return null;
        }
    }

    private String createSessionFor(String username) {
        String token = UUID.randomUUID().toString();
        String sessionKey = String.format("session:%s", token);
        redisTemplate.opsForValue().set(sessionKey, username, Duration.ofHours(2));
        return token;
    }

    public String whoami(String token) {
        if (token == null) return null;
        return redisTemplate.opsForValue().get(String.format("session:%s", token));
    }

    public void logout(String token) {
        if (token == null) return;
        String sessionKey = String.format("session:%s", token);
        redisTemplate.delete(sessionKey);
    }

    // Register a new user: store bcrypt hash in Redis under user:{username}
    // Returns true on success, false if user already exists
    public boolean register(String username, String password) {
        String key = String.format("user:%s", username);
        String existing = redisTemplate.opsForValue().get(key);
        if (existing != null) return false; // user exists
        String hashed = bcrypt.encode(password);
        redisTemplate.opsForValue().set(key, hashed);
        return true;
    }
}
