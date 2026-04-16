package com.example.tp1.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
public class AuthService {
    private final RedisTemplate<String, String> redisTemplate;

    public AuthService(RedisTemplate<String, String> redisTemplate) { this.redisTemplate = redisTemplate; }

    // Validate credentials against Redis key pattern: user:{username} -> password
    public String login(String username, String password) {
        String key = String.format("user:%s", username);
        String stored = redisTemplate.opsForValue().get(key);
        if (stored != null && stored.equals(password)) {
            // create a short-lived session token and store session:{token} -> username
            String token = UUID.randomUUID().toString();
            String sessionKey = String.format("session:%s", token);
            redisTemplate.opsForValue().set(sessionKey, username, Duration.ofHours(2));
            return token;
        }
        return null;
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
}
