package com.example.tp1.controller;

import com.example.tp1.model.Cart;
import com.example.tp1.repository.CartRepository;
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
    private final CartRepository cartRepository;

    public CartController(RedisTemplate<String, String> redisTemplate, CartRepository cartRepository) {
        this.redisTemplate = redisTemplate;
        this.cartRepository = cartRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Integer>> getCart(@RequestHeader(name = "X-Session-Token") String token) throws Exception {
        String username = redisTemplate.opsForValue().get("session:" + token);
        if (username == null) return ResponseEntity.status(401).build();

        return cartRepository.findByUsername(username)
                .map(c -> ResponseEntity.ok(c.getItems()))
                .orElse(ResponseEntity.ok(new HashMap<>()));
    }

    @PostMapping
    public ResponseEntity<Map<String, Integer>> addToCart(@RequestHeader(name = "X-Session-Token") String token,
                                                           @RequestBody Map<String, Integer> item) throws Exception {
        // item: { productId: quantity }
        String username = redisTemplate.opsForValue().get("session:" + token);
        if (username == null) return ResponseEntity.status(401).build();

        Cart cart = cartRepository.findByUsername(username).orElseGet(() -> new Cart(username));
        Map<String, Integer> items = cart.getItems();
        item.forEach((k, v) -> items.merge(k, v, Integer::sum));
        cart.setItems(items);
        cartRepository.save(cart);
        return ResponseEntity.ok(cart.getItems());
    }

    @DeleteMapping
    public ResponseEntity<Void> clear(@RequestHeader(name = "X-Session-Token") String token) {
        String username = redisTemplate.opsForValue().get("session:" + token);
        if (username == null) return ResponseEntity.status(401).build();

        cartRepository.deleteByUsername(username);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Map<String, Integer>> removeFromCart(
            @RequestHeader("X-Session-Token") String token,
            @PathVariable String productId) throws Exception {
        String username = redisTemplate.opsForValue().get("session:" + token);
        if (username == null) return ResponseEntity.status(401).build();

        Cart cart = cartRepository.findByUsername(username).orElse(null);
        if (cart == null) return ResponseEntity.ok(new HashMap<>());

        Map<String, Integer> items = cart.getItems();
        items.remove(productId);
        cart.setItems(items);
        cartRepository.save(cart);
        return ResponseEntity.ok(cart.getItems());
    }
}
