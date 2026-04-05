package com.example.backend.service;

import com.example.backend.dto.WishlistItemDto;
import com.example.backend.dto.WishlistItemRequest;
import com.example.backend.model.Product;
import com.example.backend.model.User;
import com.example.backend.model.WishlistItem;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public WishlistItemDto toDto(WishlistItem item) {
        WishlistItemDto dto = new WishlistItemDto();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setImageUrl(item.getProduct().getImageUrl());
        dto.setPrice(item.getProduct().getPrice().doubleValue());
        return dto;
    }

    public List<WishlistItemDto> getWishlist() {
        User user = getCurrentUser();
        return wishlistItemRepository.findAll().stream()
                .filter(item -> item.getUser().getId().equals(user.getId()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public WishlistItemDto addToWishlist(WishlistItemRequest request) {
        User user = getCurrentUser();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        WishlistItem item = wishlistItemRepository.findAll().stream()
                .filter(i -> i.getUser().getId().equals(user.getId()) && i.getProduct().getId().equals(product.getId()))
                .findFirst().orElse(null);
        if (item == null) {
            item = WishlistItem.builder().user(user).product(product).build();
        }
        return toDto(wishlistItemRepository.save(item));
    }

    public void removeFromWishlist(Long wishlistItemId) {
        wishlistItemRepository.deleteById(wishlistItemId);
    }

    public void moveToCart(Long wishlistItemId) {
        // This should add the item to cart and remove from wishlist
        // Implemented in CartService or here as needed
    }
}
