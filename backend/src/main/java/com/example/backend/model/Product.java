package com.example.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"cartItems", "wishlistItems", "orderItems", "reviews"})
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String name;
    private String category;
    private String description;
    private BigDecimal price;
    private int stock;
    private String imageUrl;
    private boolean active;

    @OneToMany(mappedBy = "product")
    private Set<CartItem> cartItems;

    @OneToMany(mappedBy = "product")
    private Set<WishlistItem> wishlistItems;

    @OneToMany(mappedBy = "product")
    private Set<OrderItem> orderItems;

    @OneToMany(mappedBy = "product")
    private Set<Review> reviews;
}
