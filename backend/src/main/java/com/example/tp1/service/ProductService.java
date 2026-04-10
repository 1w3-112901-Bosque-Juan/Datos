package com.example.tp1.service;

import com.example.tp1.model.Product;
import com.example.tp1.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    private final ProductRepository repo;

    public ProductService(ProductRepository repo) { this.repo = repo; }

    public List<Product> findAll() { return repo.findAll(); }
    public Optional<Product> findById(String id) { return repo.findById(id); }
    public Product create(Product p) { return repo.save(p); }
    public Product update(String id, Product p) {
        p.setId(id);
        return repo.save(p);
    }
    public void delete(String id) { repo.deleteById(id); }
}
