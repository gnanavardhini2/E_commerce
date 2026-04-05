package com.example.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDto {
    private Long id;
    private BigDecimal totalPrice;
    private String status;
    private String address;
    private LocalDateTime createdAt;
    private List<OrderItemDto> items;
}
