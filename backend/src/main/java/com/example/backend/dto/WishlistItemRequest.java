package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WishlistItemRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;
}
