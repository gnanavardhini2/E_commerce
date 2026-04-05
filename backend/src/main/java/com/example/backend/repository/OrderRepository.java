package com.example.backend.repository;

import com.example.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
	boolean existsByUserIdAndStatusAndOrderItemsProductId(Long userId, Order.Status status, Long productId);
}
