package com.example.backend.controller;

import com.example.backend.dto.OrderDto;
import com.example.backend.dto.PlaceOrderRequest;
import com.example.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {
    private final OrderService orderService;

    // User: Place order
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderDto> placeOrder(@RequestBody @Valid PlaceOrderRequest request) {
        return ResponseEntity.ok(orderService.placeOrder(request));
    }

    // User: Get order history
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<OrderDto>> getUserOrders() {
        return ResponseEntity.ok(orderService.getUserOrders());
    }

    // Admin: Get all orders
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // Admin: Update order status
    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDto> updateStatus(@PathVariable Long orderId, @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateStatus(orderId, status));
    }

    // User/Admin: Cancel order
    @PutMapping("/{orderId}/cancel")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<OrderDto> cancelOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId));
    }
}
