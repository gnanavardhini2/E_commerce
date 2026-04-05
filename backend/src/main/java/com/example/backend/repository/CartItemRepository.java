package com.example.backend.repository;

import com.example.backend.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
	@Modifying
	@Query("delete from CartItem c where c.user.id = :userId")
	void deleteByUserId(@Param("userId") Long userId);
}
