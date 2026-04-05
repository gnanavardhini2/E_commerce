package com.example.backend.dto;

import lombok.Data;

@Data
public class ReviewDto {
    private Long id;
    private Long productId;
    private String userName;
    private int rating;
    private String comment;
}
