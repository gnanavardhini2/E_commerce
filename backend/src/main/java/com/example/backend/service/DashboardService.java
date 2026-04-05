package com.example.backend.service;

import com.example.backend.dto.DashboardStatsDto;
import com.example.backend.model.Order;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public DashboardStatsDto getStats() {
        DashboardStatsDto dto = new DashboardStatsDto();
        dto.setTotalProducts(productRepository.count());
        dto.setTotalUsers(userRepository.count());
        dto.setTotalOrders(orderRepository.count());
        dto.setDeliveredOrders(orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == Order.Status.DELIVERED).count());
        dto.setTotalRevenue(orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == Order.Status.DELIVERED)
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return dto;
    }
}
