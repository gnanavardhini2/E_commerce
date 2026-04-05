
import React, { useState, ReactNode } from "react";
import './ProductCard.css';

type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  rating?: number;
  discount?: number;
  category?: string;
  description?: string;
  stock?: number;
};



type Props = {
  product: Product;
  onAddToCart: () => void;
  onAddToWishlist?: () => void;
  wishlisted?: boolean;
  onViewDetails?: () => void;
  addToCartLabel?: string;
  removeLabel?: ReactNode;
  onRemove?: () => void;
};


const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='%2364748b' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

function SkeletonLoader() {
  return (
    <div className="skeleton-image" style={{height: 200, width: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16, marginBottom: 12}} />
  );
}

export default function ProductCard({ product, onAddToCart, onAddToWishlist, wishlisted, onViewDetails, onRemove, addToCartLabel, removeLabel }: Props) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const categoryText = (product.category || 'General').trim();
  const descriptionText = (product.description || '').trim();
  const hasStockInfo = typeof product.stock === 'number';

  return (
    <div className="product-card premium-card polished-card">
      {/* Discount Badge */}
      {product.discount && (
        <div className="discount-badge">{product.discount}% OFF</div>
      )}
      {/* Wishlist Heart Button */}
      {onAddToWishlist && (
        <button
          onClick={onAddToWishlist}
          aria-label={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`wishlist-heart${wishlisted ? ' wishlisted' : ''}`}
        >
          {wishlisted ? '❤️' : '🤍'}
        </button>
      )}
      {/* Product Image with skeleton loader */}
      <div className="image-wrapper">
        {!imgLoaded && <SkeletonLoader />}
        <img
          src={imgError ? FALLBACK_IMAGE : product.imageUrl || FALLBACK_IMAGE}
          alt={product.name}
          className={`product-image premium-image${imgLoaded ? ' loaded' : ' hidden'}`}
          onError={() => setImgError(true)}
          onLoad={() => setImgLoaded(true)}
          style={{ display: imgLoaded ? 'block' : 'none' }}
        />
      </div>
      {/* Name (2-line clamp) */}
      <div className="product-title premium-title clamp-2" title={product.name}>
        {product.name}
      </div>
      {/* Rating */}
      {product.rating && (
        <div className="product-rating">
          <span>⭐ {product.rating}</span>
        </div>
      )}
      {/* Price */}
      <div className="product-price premium-price">
        ₹{product.price}
      </div>
      {/* Product details */}
      <div className="product-details-block">
        <div className="product-detail-row">
          <span className="product-detail-chip">{categoryText}</span>
          {hasStockInfo && (
            <span className={`product-stock ${product.stock && product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock && product.stock > 0 ? `In stock: ${product.stock}` : 'Out of stock'}
            </span>
          )}
        </div>
        {descriptionText && (
          <p className="product-description clamp-2" title={descriptionText}>
            {descriptionText}
          </p>
        )}
      </div>
      {/* Buttons */}
      <div className="product-actions">
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="product-details-btn"
            aria-label="View details"
          >
            Details
          </button>
        )}
        <button
          onClick={onAddToCart}
          className="add-cart-btn premium-cart-btn"
          aria-label="Add to Cart"
        >
          {addToCartLabel || 'Add to Cart'}
        </button>
        {onRemove && (
          <button
            onClick={onRemove}
            className="wishlist-btn premium-wishlist-btn"
            aria-label="Remove"
            title="Remove from Wishlist"
          >
            {removeLabel || 'Remove'}
          </button>
        )}
      </div>
    </div>
  );
}
