package com.example.backend.repository;

import com.example.backend.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
}
