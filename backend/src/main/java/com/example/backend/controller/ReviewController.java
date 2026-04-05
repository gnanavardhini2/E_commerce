package com.example.backend.controller;

import com.example.backend.dto.ReviewDto;
import com.example.backend.dto.ReviewRequest;
import com.example.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    // User: Submit review
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ReviewDto> submitReview(@RequestBody @Valid ReviewRequest request) {
        return ResponseEntity.ok(reviewService.submitReview(request));
    }

    // Public: Get reviews for a product
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDto>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    // User: Get my submitted reviews
    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ReviewDto>> getMyReviews() {
        return ResponseEntity.ok(reviewService.getCurrentUserReviews());
    }
}
