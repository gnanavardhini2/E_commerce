package com.example.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;
import java.util.Collection;
import java.util.Collections;
import java.time.LocalDateTime;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"password", "cartItems", "wishlistItems", "orders", "reviews"})
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "enabled")
    private Boolean enabled;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_token_expiry")
    private LocalDateTime resetPasswordTokenExpiry;

    @OneToMany(mappedBy = "user")
    private Set<CartItem> cartItems;

    @OneToMany(mappedBy = "user")
    private Set<WishlistItem> wishlistItems;

    @OneToMany(mappedBy = "user")
    private Set<Order> orders;

    @OneToMany(mappedBy = "user")
    private Set<Review> reviews;

    public enum Role {
        USER, ADMIN
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.enabled == null) {
            this.enabled = true;
        }
    }

    // UserDetails implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return !Boolean.FALSE.equals(enabled);
    }
    
        public String getPassword() {
            return password;
        }

        public String getEmail() {
            return email;
        }

        public Role getRole() {
            return role;
        }
}
