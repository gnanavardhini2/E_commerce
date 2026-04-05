package com.example.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductDto {
    private Long id;
    private String name;
    private String category;
    private String description;
    private BigDecimal price;
    private int stock;
    private String imageUrl;
    private boolean active;
    private double averageRating;
}
