package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequest {
    @NotBlank(message = "Name is required")
    private String name;
    @NotBlank(message = "Category is required")
    private String category;
    @NotBlank(message = "Description is required")
    private String description;
    @NotNull(message = "Price is required")
    private BigDecimal price;
    @NotNull(message = "Stock is required")
    private Integer stock;
    @NotBlank(message = "Image URL is required")
    private String imageUrl;
    private boolean active = true;
}
