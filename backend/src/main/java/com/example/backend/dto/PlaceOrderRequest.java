package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class PlaceOrderRequest {
    @NotBlank(message = "Address is required")
    private String address;
    @NotNull(message = "Order items required")
    private List<OrderItemRequest> items;

    // Optional from frontend checkout summary; backend computes authoritative total.
    private BigDecimal totalPrice;
}
