package com.example.tp1.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

// Product is a flexible MongoDB document. "attributes" holds type-specific fields (eg. idioma, pulgadas)
@Document(collection = "products")
public class Product {
    @Id
    private String id;
    private String name;
    private String type; // monitor, teclado, procesador, etc.
    private Double price;
    private String image;
    private Map<String, Object> attributes; // flexible schema fields

    public Product() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public Map<String, Object> getAttributes() { return attributes; }
    public void setAttributes(Map<String, Object> attributes) { this.attributes = attributes; }
}
