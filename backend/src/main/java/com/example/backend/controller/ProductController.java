package com.example.backend.controller;

import com.example.backend.dto.ProductDto;
import com.example.backend.dto.ProductRequest;
import com.example.backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    // User: Get all active products
    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllActive() {
        return ResponseEntity.ok(productService.getAllActive());
    }

    // Admin: Get all products (including disabled)
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductDto>> getAllForAdmin() {
        return ResponseEntity.ok(productService.getAll());
    }

    // User: Search & paginate
    @GetMapping("/search")
    public ResponseEntity<Page<ProductDto>> search(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(productService.search(keyword, page, size));
    }

    // Admin: Add product
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> create(@RequestBody @Valid ProductRequest request) {
        return ResponseEntity.ok(productService.create(request));
    }

    // Admin: Edit product
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> update(@PathVariable Long id, @RequestBody @Valid ProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    // Admin: Delete product
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Admin: Enable/Disable product
    @PatchMapping("/{id}/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> enable(@PathVariable Long id, @RequestParam boolean enable) {
        return ResponseEntity.ok(productService.enable(id, enable));
    }

    // Admin: Toggle product active state (backward-compatible endpoint)
    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(productService.toggle(id));
    }

    // Admin: Toggle product active state (accept PATCH as well)
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> togglePatch(@PathVariable Long id) {
        return ResponseEntity.ok(productService.toggle(id));
    }

    // User/Admin: Get product by id
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(productService.get(id));
    }
}
