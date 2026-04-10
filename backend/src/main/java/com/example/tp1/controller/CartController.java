package com.example.tp1.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.HashMap;
import java.util.Map;

// Simple cart controller that stores per-user cart in Redis under key: cart:{username}
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper mapper = new ObjectMapper();

    public CartController(RedisTemplate<String, String> redisTemplate) { this.redisTemplate = redisTemplate; }

    @GetMapping
    public ResponseEntity<Map<String, Integer>> getCart(@RequestHeader(name = "X-Session-Token") String token) throws Exception {
        String username = redisTemplate.opsForValue().get("session:" + token);
        if (username == null) return ResponseEntity.status(401).build();
        String raw = redisTemplate.opsForValue().get("cart:" + username);
        if (raw == null) return ResponseEntity.ok(new HashMap<>());
        Map<String, Integer> cart = mapper.readValue(raw, new TypeReference<Map<String,Integer>>(){});
        return ResponseEntity.ok(cart);
    }

    @PostMapping
    public ResponseEntity<Map<String, Integer>> addToCart(@RequestHeader(name = "X-Session-Token") String token,
                                                           @RequestBody Map<String, Integer> item) throws Exception {
        // item: { productId: quantity }
        String username = redisTemplate.opsForValue().get("session:" + token);
        if (username == null) return ResponseEntity.status(401).build();
        String key = "cart:" + username;
        String raw = redisTemplate.opsForValue().get(key);
        Map<String, Integer> cart = raw == null ? new HashMap<>() : mapper.readValue(raw, new TypeReference<Map<String,Integer>>(){});
        item.forEach((k,v) -> cart.merge(k, v, Integer::sum));
        redisTemplate.opsForValue().set(key, mapper.writeValueAsString(cart));
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping
    public ResponseEntity<Void> clear(@RequestHeader(name = "X-Session-Token") String token) {
        String username = redisTemplate.opsForValue().get("session:" + token);
        if (username == null) return ResponseEntity.status(401).build();
        redisTemplate.delete("cart:" + username);
        return ResponseEntity.noContent().build();
    }
}
