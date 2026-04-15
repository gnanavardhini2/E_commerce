package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.model.*;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.concurrent.atomic.AtomicReference;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final EmailService emailService;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public OrderDto toDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setStatus(order.getStatus().name());
        dto.setAddress(order.getAddress());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setItems(order.getOrderItems().stream().map(this::toItemDto).collect(Collectors.toList()));
        return dto;
    }

    public OrderItemDto toItemDto(OrderItem item) {
        OrderItemDto dto = new OrderItemDto();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setProductImageUrl(item.getProduct().getImageUrl());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());
        return dto;
    }

    @Transactional
    public OrderDto placeOrder(PlaceOrderRequest request) {
        return placeOrder(request, null, null, null);
    }

    @Transactional
    public OrderDto placeOrder(PlaceOrderRequest request, String origin, String referer, HttpServletRequest httpRequest) {
        User user = getCurrentUser();
        String resolvedFrontendBaseUrl = resolveFrontendBaseUrl(origin, referer, httpRequest);
        String[] profileFromAddress = parseNameAndPhone(request.getAddress());
        Order order = Order.builder()
                .user(user)
                .address(request.getAddress())
            .shippingAddress(request.getAddress())
                .status(Order.Status.PROCESSING)
            .totalPrice(BigDecimal.ZERO)
            .totalAmount(BigDecimal.ZERO)
            .customerEmailSnapshot(user.getEmail())
            .customerNameSnapshot(profileFromAddress[0])
            .customerPhoneSnapshot(profileFromAddress[1])
                .createdAt(LocalDateTime.now())
                .build();
        orderRepository.save(order);
        AtomicReference<BigDecimal> total = new AtomicReference<>(BigDecimal.ZERO);
        Set<OrderItem> items = request.getItems().stream().map(itemReq -> {
            Product product = productRepository.findById(itemReq.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
            if (product.getStock() < itemReq.getQuantity())
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);
            OrderItem item = OrderItem.builder()
                .order(order)
                .product(product)
                .quantity(itemReq.getQuantity())
                .price(product.getPrice())
                .build();
            total.set(total.get().add(product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()))));
            return orderItemRepository.save(item);
        }).collect(Collectors.toSet());
        order.setOrderItems(items);
        order.setTotalPrice(total.get());
        order.setTotalAmount(total.get());
        orderRepository.save(order);
        // Optionally clear user's cart
        cartItemRepository.deleteByUserId(user.getId());

        try {
            emailService.sendHtmlEmail(
                    user.getEmail(),
                    "Order Confirmed - #" + order.getId(),
                    buildOrderConfirmationHtml(user, order, resolvedFrontendBaseUrl)
            );
        } catch (Exception e) {
            // Do not fail order placement if email delivery fails.
            System.err.println("Order email failed: " + e.getMessage());
        }

        return toDto(order);
    }

    private String buildOrderConfirmationHtml(User user, Order order, String frontendBaseUrlForEmail) {
        String orderLink = frontendBaseUrlForEmail + "/#/orders/" + order.getId();
        return "<div style='font-family: Arial, sans-serif; color: #111827; line-height: 1.6;'>"
                + "<h2 style='margin:0 0 12px 0;'>Order Confirmed - #" + order.getId() + "</h2>"
                + "<p>Hello " + user.getName() + ",</p>"
                + "<p>Your order has been placed successfully.</p>"
                + "<div style='background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:12px;'>"
                + "<p style='margin:4px 0;'><strong>Order ID:</strong> " + order.getId() + "</p>"
                + "<p style='margin:4px 0;'><strong>Status:</strong> " + statusLabel(order.getStatus()) + "</p>"
            + "<p style='margin:4px 0;'><strong>Total:</strong> " + formatCurrency(order.getTotalPrice()) + "</p>"
                + "<p style='margin:4px 0;'><strong>Shipping Address:</strong> " + order.getShippingAddress() + "</p>"
                + "<p style='margin:8px 0 4px 0;'><strong>Order Flow:</strong> " + buildStatusFlow(order.getStatus()) + "</p>"
                + "</div>"
            + "<div style='margin-top:14px;'>"
            + "<a href='" + orderLink + "' style='display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; font-weight:700; padding:10px 16px; border-radius:8px;'>Track Order</a>"
            + "</div>"
                + "<p style='margin-top:14px;'>Thank you for shopping with us.</p>"
                + "</div>";
    }

    private String buildOrderStatusHtml(Order order) {
        String orderLink = frontendBaseUrl + "/#/orders/" + order.getId();
        return "<div style='font-family: Arial, sans-serif; color: #111827; line-height: 1.6;'>"
                + "<h2 style='margin:0 0 12px 0;'>Order Update - #" + order.getId() + "</h2>"
                + "<p>" + statusMessage(order.getStatus()) + "</p>"
                + "<div style='background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:12px;'>"
                + "<p style='margin:4px 0;'><strong>Order ID:</strong> " + order.getId() + "</p>"
                + "<p style='margin:4px 0;'><strong>New Status:</strong> " + statusLabel(order.getStatus()) + "</p>"
                + "<p style='margin:4px 0;'><strong>Total:</strong> " + formatCurrency(order.getTotalPrice()) + "</p>"
                + "<p style='margin:8px 0 4px 0;'><strong>Order Flow:</strong> " + buildStatusFlow(order.getStatus()) + "</p>"
                + "</div>"
                + "<div style='margin-top:14px;'>"
                + "<a href='" + orderLink + "' style='display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; font-weight:700; padding:10px 16px; border-radius:8px;'>Track Order</a>"
                + "</div>"
                + (order.getStatus() == Order.Status.DELIVERED
                ? "<p style='margin-top:14px;'>Thank you for shopping with us. Your order was delivered successfully. If you need any help, just reply to this email.</p>"
                : "")
                + (order.getStatus() == Order.Status.CANCELLED
                ? "<p style='margin-top:14px;'>Your cancellation has been confirmed. If payment was already captured, refund processing may take 3-7 business days depending on your bank.</p>"
                : "")
                + "</div>";
    }

    private String resolveFrontendBaseUrl(String origin, String referer, HttpServletRequest httpRequest) {
        if (StringUtils.hasText(origin)) {
            return origin.replaceAll("/$", "");
        }

        if (StringUtils.hasText(referer)) {
            String trimmed = referer.replaceAll("/$", "");
            int hashIdx = trimmed.indexOf("/#/");
            if (hashIdx > 0) {
                return trimmed.substring(0, hashIdx);
            }
            int pathIdx = trimmed.indexOf('/', trimmed.indexOf("://") + 3);
            if (pathIdx > -1) {
                return trimmed.substring(0, pathIdx);
            }
            return trimmed;
        }

        if (httpRequest != null) {
            String forwardedProto = httpRequest.getHeader("X-Forwarded-Proto");
            String forwardedHost = httpRequest.getHeader("X-Forwarded-Host");
            if (StringUtils.hasText(forwardedProto) && StringUtils.hasText(forwardedHost)) {
                return (forwardedProto + "://" + forwardedHost).replaceAll("/$", "");
            }
        }

        return frontendBaseUrl.replaceAll("/$", "");
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) {
            return "INR 0.00";
        }
        NumberFormat inrFormatter = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        return inrFormatter.format(amount);
    }

    private String statusMessage(Order.Status status) {
        return switch (status) {
            case PROCESSING -> "Your order is now being processed.";
            case SHIPPED -> "Great news! Your order has been shipped.";
            case DELIVERED -> "Your order has been delivered. We hope you love it!";
            case CANCELLED -> "Your order has been cancelled.";
        };
    }

    private String statusEmailSubject(Order order) {
        return switch (order.getStatus()) {
            case DELIVERED -> "Order Delivered - #" + order.getId();
            case SHIPPED -> "Order Shipped - #" + order.getId();
            case PROCESSING -> "Order Processing - #" + order.getId();
            case CANCELLED -> "Order Cancelled - #" + order.getId();
        };
    }

    private String statusLabel(Order.Status status) {
        return switch (status) {
            case PROCESSING -> "PROCESSING";
            case SHIPPED -> "SHIPPED";
            case DELIVERED -> "DELIVERED";
            case CANCELLED -> "CANCELLED";
        };
    }

    private String buildStatusFlow(Order.Status currentStatus) {
        if (currentStatus == Order.Status.CANCELLED) {
            return "PROCESSING -> SHIPPED -> DELIVERED (Current: CANCELLED)";
        }
        return "PROCESSING -> SHIPPED -> DELIVERED (Current: " + statusLabel(currentStatus) + ")";
    }

    private Order.Status parseStatus(String status) {
        String normalized = status == null ? "" : status.trim().toUpperCase();
        if ("SHIPPING".equals(normalized)) {
            normalized = "SHIPPED";
        }

        try {
            return Order.Status.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + status);
        }
    }

    private String[] parseNameAndPhone(String address) {
        if (address == null || address.isBlank()) {
            return new String[]{"Customer", "NA"};
        }

        String[] parts = address.split(",");
        String name = parts.length > 0 && !parts[0].trim().isEmpty() ? parts[0].trim() : "Customer";
        String phone = parts.length > 1 && !parts[1].trim().isEmpty() ? parts[1].trim() : "NA";
        return new String[]{name, phone};
    }

    public List<OrderDto> getUserOrders() {
        User user = getCurrentUser();
        return orderRepository.findAll().stream()
                .filter(order -> order.getUser().getId().equals(user.getId()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public OrderDto getOrderForTracking(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        return toDto(order);
    }

    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    private boolean isAdmin() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    public OrderDto cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getStatus() == Order.Status.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order already cancelled");
        }

        if (!isAdmin()) {
            User currentUser = getCurrentUser();
            if (!order.getUser().getId().equals(currentUser.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot cancel this order");
            }
        }

        if (order.getStatus() != Order.Status.PROCESSING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only processing orders can be cancelled");
        }

        order.setStatus(Order.Status.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        try {
            emailService.sendHtmlEmail(savedOrder.getUser().getEmail(), statusEmailSubject(savedOrder), buildOrderStatusHtml(savedOrder));
        } catch (Exception e) {
            System.err.println("Order status email failed: " + e.getMessage());
        }

        return toDto(savedOrder);
    }

    // Kept as a separate method to support admin PATCH status updates.
    public OrderDto updateStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(parseStatus(status));
        Order savedOrder = orderRepository.save(order);

        try {
            emailService.sendHtmlEmail(savedOrder.getUser().getEmail(), statusEmailSubject(savedOrder), buildOrderStatusHtml(savedOrder));
        } catch (Exception e) {
            System.err.println("Order status email failed: " + e.getMessage());
        }

        return toDto(savedOrder);
    }
}
