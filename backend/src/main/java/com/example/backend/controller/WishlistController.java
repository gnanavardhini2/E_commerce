package com.example.backend.controller;

import com.example.backend.dto.WishlistItemDto;
import com.example.backend.dto.WishlistItemRequest;
import com.example.backend.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class WishlistController {
    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistItemDto>> getWishlist() {
        return ResponseEntity.ok(wishlistService.getWishlist());
    }

    @PostMapping
    public ResponseEntity<WishlistItemDto> addToWishlist(@RequestBody @Valid WishlistItemRequest request) {
        return ResponseEntity.ok(wishlistService.addToWishlist(request));
    }

    @DeleteMapping("/{wishlistItemId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long wishlistItemId) {
        wishlistService.removeFromWishlist(wishlistItemId);
        return ResponseEntity.noContent().build();
    }

    // Placeholder for move to cart
    @PostMapping("/{wishlistItemId}/move-to-cart")
    public ResponseEntity<Void> moveToCart(@PathVariable Long wishlistItemId) {
        wishlistService.moveToCart(wishlistItemId);
        return ResponseEntity.ok().build();
    }
}
