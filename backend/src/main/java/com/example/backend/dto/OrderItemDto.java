package com.example.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private int quantity;
    private BigDecimal price;
}
