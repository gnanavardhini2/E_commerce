package com.example.backend.service;

import com.example.backend.dto.CartItemDto;
import com.example.backend.dto.CartItemRequest;
import com.example.backend.model.CartItem;
import com.example.backend.model.Product;
import com.example.backend.model.User;
import com.example.backend.repository.CartItemRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public CartItemDto toDto(CartItem item) {
        CartItemDto dto = new CartItemDto();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getProduct().getPrice().doubleValue());
        dto.setImageUrl(item.getProduct().getImageUrl());
        return dto;
    }

    public List<CartItemDto> getCart() {
        User user = getCurrentUser();
        return cartItemRepository.findAll().stream()
                .filter(item -> item.getUser().getId().equals(user.getId()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CartItemDto addToCart(CartItemRequest request) {
        User user = getCurrentUser();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        CartItem item = cartItemRepository.findAll().stream()
                .filter(i -> i.getUser().getId().equals(user.getId()) && i.getProduct().getId().equals(product.getId()))
                .findFirst().orElse(null);
        if (item == null) {
            item = CartItem.builder().user(user).product(product).quantity(request.getQuantity()).build();
        } else {
            item.setQuantity(item.getQuantity() + request.getQuantity());
        }
        return toDto(cartItemRepository.save(item));
    }

    public CartItemDto updateQuantity(Long cartItemId, int quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        item.setQuantity(quantity);
        return toDto(cartItemRepository.save(item));
    }

    public void removeFromCart(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }

    public void clearCart() {
        User user = getCurrentUser();
        cartItemRepository.findAll().stream()
                .filter(item -> item.getUser().getId().equals(user.getId()))
                .forEach(item -> cartItemRepository.deleteById(item.getId()));
    }
}
