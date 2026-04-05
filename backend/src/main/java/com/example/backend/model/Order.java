package com.example.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "orders")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"user", "orderItems"})
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private BigDecimal totalPrice;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(nullable = false)
    private String customerEmailSnapshot;

    @Column(nullable = false)
    private String customerNameSnapshot;

    @Column(nullable = false)
    private String customerPhoneSnapshot;

    @Column(nullable = false)
    private String shippingAddress;

    private String address;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order")
    private Set<OrderItem> orderItems;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Status {
        PROCESSING, SHIPPED, DELIVERED, CANCELLED
    }
}
