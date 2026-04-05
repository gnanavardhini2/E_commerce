package com.example.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DashboardStatsDto {
    private long totalProducts;
    private long totalUsers;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long deliveredOrders;
}
