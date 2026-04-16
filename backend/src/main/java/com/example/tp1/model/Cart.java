package com.example.tp1.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashMap;
import java.util.Map;

@Document(collection = "carts")
public class Cart {
    @Id
    private String id;

    private String username;

    private Map<String, Integer> items = new HashMap<>();

    public Cart() {}

    public Cart(String username) { this.username = username; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Map<String, Integer> getItems() { return items; }
    public void setItems(Map<String, Integer> items) { this.items = items; }
}
