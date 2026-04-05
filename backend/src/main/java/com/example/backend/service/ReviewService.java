package com.example.backend.service;

import com.example.backend.dto.ReviewDto;
import com.example.backend.dto.ReviewRequest;
import com.example.backend.model.Product;
import com.example.backend.model.Review;
import com.example.backend.model.User;
import com.example.backend.model.Order;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public ReviewDto toDto(Review review) {
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setProductId(review.getProduct().getId());
        dto.setUserName(review.getUser().getName());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        return dto;
    }

    public ReviewDto submitReview(ReviewRequest request) {
        User user = getCurrentUser();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        boolean hasDeliveredOrder = orderRepository.existsByUserIdAndStatusAndOrderItemsProductId(
            user.getId(),
            Order.Status.DELIVERED,
            product.getId()
        );
        if (!hasDeliveredOrder) {
            throw new RuntimeException("You can review only delivered products");
        }

        // Only one review per user per product
        boolean alreadyReviewed = reviewRepository.existsByUserIdAndProductId(user.getId(), product.getId());
        if (alreadyReviewed) throw new RuntimeException("You have already reviewed this product");

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        return toDto(reviewRepository.save(review));
    }

    public List<ReviewDto> getProductReviews(Long productId) {
        return reviewRepository.findByProductId(productId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

        public List<ReviewDto> getCurrentUserReviews() {
        User user = getCurrentUser();
        return reviewRepository.findByUserId(user.getId()).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
        }
}
