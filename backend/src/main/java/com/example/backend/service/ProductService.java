package com.example.backend.service;

import com.example.backend.dto.ProductDto;
import com.example.backend.dto.ProductRequest;
import com.example.backend.model.Product;
import com.example.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    public ProductDto toDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setCategory(product.getCategory());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setImageUrl(product.getImageUrl());
        dto.setActive(product.isActive());
        dto.setAverageRating(product.getReviews() == null || product.getReviews().isEmpty() ? 0.0 :
            product.getReviews().stream().mapToInt(r -> r.getRating()).average().orElse(0.0));
        return dto;
    }

    public ProductDto create(ProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .category(request.getCategory())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .active(request.isActive())
                .build();
        return toDto(productRepository.save(product));
    }

    public ProductDto update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        product.setName(request.getName());
        product.setCategory(request.getCategory());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        product.setActive(request.isActive());
        return toDto(productRepository.save(product));
    }

    public void delete(Long id) {
        productRepository.deleteById(id);
    }

    public ProductDto enable(Long id, boolean enable) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(enable);
        return toDto(productRepository.save(product));
    }

    public ProductDto toggle(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(!product.isActive());
        return toDto(productRepository.save(product));
    }

    public ProductDto get(Long id) {
        return toDto(productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found")));
    }

    public List<ProductDto> getAll() {
        return productRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> getAllActive() {
        return productRepository.findAll().stream()
                .filter(Product::isActive)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Page<ProductDto> search(String keyword, int page, int size) {
        Page<Product> products = productRepository.findAll(PageRequest.of(page, size));
        return products.map(this::toDto);
    }
}
