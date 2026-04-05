

import React, { useState } from "react";

import { Heart } from "lucide-react";
import { useShop } from "../context/ShopContext";
import "./Home.css";
import "./UserPanel.css";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='%2364748b' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";



const WishlistPage = () => {
  const { wishlistItems, moveToCart, removeFromWishlist, cartItems } = useShop();
  const [toast, setToast] = useState<string | null>(null);

  const handleMoveToCart = (product: any) => {
    if (cartItems.some((item) => item.product.id === product.id)) {
      setToast("Already in Cart");
    } else {
      moveToCart(product);
      setToast("Moved from Wishlist to Cart");
    }
    setTimeout(() => setToast(null), 1500);
  };

  const handleRemove = (productId: number) => {
    removeFromWishlist(productId);
    setToast("Removed from Wishlist");
    setTimeout(() => setToast(null), 1500);
  };

  return (
    <div className="home-bg user-shell">
      <div className="user-container">
        <h2 className="user-page-title">Your Wishlist</h2>
        <p className="user-page-subtitle" style={{ marginBottom: 20 }}>Save products and move them to cart anytime.</p>
        {toast && (
          <div className="toast-message">{toast}</div>
        )}
        {wishlistItems.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 36, marginBottom: 36 }}>
            <Heart className="empty-state-icon" />
            <div className="empty-state-title">Your wishlist is empty ❤️</div>
            <div className="empty-state-subtext">Add products to your wishlist to see them here.</div>
            <a href="/home" style={{ textDecoration: 'none', marginTop: 24 }}>
              <button className="hero-btn" style={{ fontWeight: 700, fontSize: '1.1rem', padding: '0.75rem 2.5rem' }}>Continue Shopping</button>
            </a>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((product) => (
              <div key={product.id} className="surface-card wishlist-card">
                <img
                  src={product.imageUrl || FALLBACK_IMAGE}
                  alt={product.name}
                  className="wishlist-image"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.onerror = null;
                    img.src = FALLBACK_IMAGE;
                  }}
                />
                <h3 className="wishlist-name">{product.name}</h3>
                <div className="wishlist-price">₹{product.price}</div>
                <div className="wishlist-actions">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="primary-gradient-btn"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.95rem' }}
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="outline-danger-btn"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.95rem' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
