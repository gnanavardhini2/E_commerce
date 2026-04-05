package com.example.backend.controller;

import com.example.backend.dto.CartItemDto;
import com.example.backend.dto.CartItemRequest;
import com.example.backend.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class CartController {
    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItemDto>> getCart() {
        return ResponseEntity.ok(cartService.getCart());
    }

    @PostMapping
    public ResponseEntity<CartItemDto> addToCart(@RequestBody @Valid CartItemRequest request) {
        return ResponseEntity.ok(cartService.addToCart(request));
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartItemDto> updateQuantity(@PathVariable Long cartItemId, @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.updateQuantity(cartItemId, quantity));
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long cartItemId) {
        cartService.removeFromCart(cartItemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart();
        return ResponseEntity.noContent().build();
    }
}
