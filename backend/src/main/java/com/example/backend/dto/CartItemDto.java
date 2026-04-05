package com.example.backend.dto;

import lombok.Data;

@Data
public class CartItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private int quantity;
    private double price;
    private String imageUrl;
}
