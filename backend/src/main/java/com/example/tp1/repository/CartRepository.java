package com.example.tp1.repository;

import com.example.tp1.model.Cart;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CartRepository extends MongoRepository<Cart, String> {
    Optional<Cart> findByUsername(String username);
    void deleteByUsername(String username);
}
