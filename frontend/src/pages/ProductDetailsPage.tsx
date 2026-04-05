import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api';
import './Home.css';
import './UserPanel.css';

type ProductDetails = {
  id: number;
  name: string;
  category?: string;
  description?: string;
  price: number;
  stock?: number;
  imageUrl?: string;
  averageRating?: number;
};

type ProductReview = {
  id: number;
  productId: number;
  userName: string;
  rating: number;
  comment: string;
};

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='300' viewBox='0 0 360 300'%3E%3Crect width='360' height='300' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='%2364748b' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [productRes, reviewsRes] = await Promise.all([
          API.get(`/products/${id}`),
          API.get(`/reviews/product/${id}`),
        ]);
        setProduct(productRes.data || null);
        setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
      } catch {
        setProduct(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return product?.averageRating || 0;
    const total = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
    return total / reviews.length;
  }, [product?.averageRating, reviews]);

  if (loading) {
    return (
      <div className="home-bg user-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="surface-card" style={{ padding: 30, fontWeight: 700, color: '#334155' }}>Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="home-bg user-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="surface-card" style={{ padding: 30, textAlign: 'center' }}>
          <h2 className="user-page-title" style={{ fontSize: '1.6rem', marginBottom: 10 }}>Product not found</h2>
          <button className="ghost-link-btn" onClick={() => navigate('/products')}>Back to Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-bg user-shell">
      <div className="product-detail-page">
        <button className="ghost-link-btn" onClick={() => navigate(-1)} style={{ marginBottom: 14 }}>← Back</button>

        <div className="product-detail-grid">
          <div className="surface-card" style={{ padding: 14 }}>
            <img
              src={product.imageUrl || FALLBACK_IMAGE}
              alt={product.name}
              className="product-detail-image"
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                img.onerror = null;
                img.src = FALLBACK_IMAGE;
              }}
            />
          </div>

          <div className="surface-card" style={{ padding: 20 }}>
            <h1 className="user-page-title" style={{ marginBottom: 8 }}>{product.name}</h1>
            <p className="user-page-subtitle" style={{ marginBottom: 14 }}>{product.category || 'General'}</p>

            <div style={{ color: '#4f46e5', fontWeight: 800, fontSize: '1.8rem', marginBottom: 10 }}>
              ₹{product.price}
            </div>

            <div style={{ marginBottom: 10, fontSize: '0.95rem', color: '#334155' }}>
              <strong>Stock:</strong> {typeof product.stock === 'number' ? product.stock : 'N/A'}
            </div>

            <div style={{ marginBottom: 14, fontSize: '0.95rem', color: '#334155' }}>
              <strong>Average Rating:</strong> {avgRating.toFixed(1)} / 5
            </div>

            <p style={{ margin: 0, color: '#475569', lineHeight: 1.55 }}>
              {product.description || 'No description available for this product.'}
            </p>
          </div>
        </div>

        <div className="surface-card product-reviews-card">
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: 800 }}>Customer Comments</h3>
          <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Comments are shown only in full product details.</p>

          {reviews.length === 0 ? (
            <p style={{ marginTop: 14, color: '#64748b' }}>No comments yet for this product.</p>
          ) : (
            <div style={{ marginTop: 10 }}>
              {reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div>
                    <span className="review-user">{review.userName}</span>
                    <span className="review-stars">{'★'.repeat(Math.max(0, Math.min(5, Number(review.rating || 0))))}</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
