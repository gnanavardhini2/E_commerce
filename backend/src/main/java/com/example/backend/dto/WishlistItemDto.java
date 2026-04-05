package com.example.backend.dto;

import lombok.Data;

@Data
public class WishlistItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String imageUrl;
    private double price;
}
