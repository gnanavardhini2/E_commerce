import { useShop } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, Info } from "lucide-react";
import API from "../api";
import "./Home.css";
import "./UserPanel.css";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' font-size='12' fill='%2364748b' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

type ReviewEntry = {
  productId: number;
  rating: number;
  comment: string;
};

type OrderProductRowProps = {
  item: any;
  canRate: boolean;
  existingReview?: ReviewEntry;
  onRate: (item: any) => void;
  onViewProduct: (productId: number) => void;
};

function OrderProductRow({ item, canRate, existingReview, onRate, onViewProduct }: OrderProductRowProps) {
  return (
    <div className="order-product-row">
      <img
        src={item.product.imageUrl || FALLBACK_IMAGE}
        alt={item.product.name}
        className="order-product-image"
        onError={e => {
          const img = e.currentTarget as HTMLImageElement;
          img.onerror = null;
          img.src = FALLBACK_IMAGE;
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 16, marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product.name}</div>
        {item.product.category && <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 700, marginBottom: 1 }}>{item.product.category}</div>}
        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Qty: {item.quantity}</div>
        <div className="order-product-actions-mini">
          <button
            className="order-link-btn"
            onClick={(e) => {
              e.stopPropagation();
              onViewProduct(item.product.id);
            }}
          >
            View Product Details
          </button>
          {canRate && !existingReview && (
            <button
              className="order-rate-btn"
              onClick={(e) => {
                e.stopPropagation();
                onRate(item);
              }}
            >
              Rate Product
            </button>
          )}
          {canRate && existingReview && (
            <span className="order-rated-pill">Rated {existingReview.rating}/5</span>
          )}
        </div>
      </div>
    </div>
  );
}

const STATUS_STEPS = ["PROCESSING", "SHIPPING", "DELIVERED"] as const;

const normalizeStatus = (rawStatus: string) => {
  const status = String(rawStatus || "").toUpperCase();
  if (status === "SHIPPED") return "SHIPPING";
  return status;
};

const getStatusMeta = (status: string) => {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case "PROCESSING":
      return { label: "Processing", color: "#0ea5e9", bg: "#e0f2fe", icon: <Clock size={16} style={{ marginRight: 4 }} /> };
    case "SHIPPING":
      return { label: "Shipped", color: "#f59e0b", bg: "#fef3c7", icon: <Clock size={16} style={{ marginRight: 4 }} /> };
    case "DELIVERED":
      return { label: "Delivered", color: "#22c55e", bg: "#dcfce7", icon: <CheckCircle size={16} style={{ marginRight: 4 }} /> };
    case "CANCELLED":
      return { label: "Cancelled", color: "#ef4444", bg: "#fee2e2", icon: <XCircle size={16} style={{ marginRight: 4 }} /> };
    default:
      return { label: "Placed", color: "#6366f1", bg: "#eef2ff", icon: <Clock size={16} style={{ marginRight: 4 }} /> };
  }
};

function OrderStatusFlow({ status }: { status: string }) {
  const normalizedStatus = normalizeStatus(status);
  const activeIndex = STATUS_STEPS.indexOf(normalizedStatus as (typeof STATUS_STEPS)[number]);
  const isCancelled = normalizedStatus === "CANCELLED";

  if (isCancelled) {
    return (
      <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: '#ef4444', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 10px', display: 'inline-flex' }}>
        Order cancelled
      </div>
    );
  }

  return (
    <div className="order-steps">
      {STATUS_STEPS.map((step, index) => {
        const isDone = activeIndex >= index;
        return (
          <div
            key={step}
            style={{
              padding: '5px 10px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              color: isDone ? '#0f172a' : '#94a3b8',
              background: isDone ? '#dbeafe' : '#f8fafc',
              border: `1px solid ${isDone ? '#93c5fd' : '#e2e8f0'}`,
            }}
          >
            {step === 'SHIPPING' ? 'Shipped' : step.charAt(0) + step.slice(1).toLowerCase()}
          </div>
        );
      })}
    </div>
  );
}

const OrdersPage = () => {
  const { orders, updateOrderStatus, refreshOrders } = useShop();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [myReviewsByProduct, setMyReviewsByProduct] = useState<Record<number, ReviewEntry>>({});
  const [showRateModal, setShowRateModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string } | null>(null);

  const fetchMyReviews = async () => {
    try {
      const res = await API.get('/reviews/my');
      const rows = Array.isArray(res.data) ? res.data : [];
      const mapped = rows.reduce((acc: Record<number, ReviewEntry>, row: any) => {
        const productId = Number(row.productId);
        if (!Number.isNaN(productId)) {
          acc[productId] = {
            productId,
            rating: Number(row.rating || 0),
            comment: String(row.comment || ''),
          };
        }
        return acc;
      }, {});
      setMyReviewsByProduct(mapped);
    } catch {
      // Keep orders usable even if review fetch fails.
      setMyReviewsByProduct({});
    }
  };

  useEffect(() => {
    refreshOrders();
    fetchMyReviews();
    const timer = window.setInterval(() => {
      refreshOrders();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [refreshOrders]);

  const sortedOrders = useMemo(
    () => [...orders].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders]
  );

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCancel = async (orderId: number) => {
    console.log("Cancel clicked:", orderId);

    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      await API.put(`/orders/${orderId}/cancel`, {});

      // Update UI instantly
      updateOrderStatus(orderId, "CANCELLED");
      refreshOrders();
      alert("Order cancelled successfully");
    } catch (error) {
      const axiosError = error as any;
      const backendMessage =
        axiosError?.response?.data?.error ||
        axiosError?.response?.data ||
        "Failed to cancel order";
      console.log("Cancel error:", axiosError?.response?.data);
      alert(backendMessage);
    }
  };

  const openRateModal = (item: any) => {
    setSelectedProduct({ id: Number(item.product.id), name: String(item.product.name) });
    setRating(5);
    setComment("");
    setShowRateModal(true);
  };

  const submitRating = async () => {
    if (!selectedProduct) return;
    if (!comment.trim()) {
      alert('Please add a comment before submitting your rating.');
      return;
    }

    setSubmittingReview(true);
    try {
      const payload = {
        productId: selectedProduct.id,
        rating,
        comment: comment.trim(),
      };
      await API.post('/reviews', payload);
      await fetchMyReviews();
      setShowRateModal(false);
      setSelectedProduct(null);
      alert('Thanks! Your rating has been submitted.');
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data ||
        'Failed to submit rating';
      alert(String(message));
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="home-bg user-shell">
      <div className="user-container" style={{ maxWidth: 980 }}>
        <h2 className="user-page-title">My Orders</h2>
        <div className="orders-header">
          <div className="user-page-subtitle">Track and manage your orders</div>
            <button
              type="button"
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="orders-refresh-btn"
              style={{ opacity: isRefreshing ? 0.7 : 1, cursor: isRefreshing ? 'not-allowed' : 'pointer' }}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
            </button>
        </div>
        {sortedOrders.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: 18, marginTop: 80, fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <img src="https://cdn-icons-png.flaticon.com/512/4072/4072301.png" alt="No orders" style={{ width: 120, height: 120, marginBottom: 8, opacity: 0.85 }} />
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 2 }}>You have no orders yet</div>
            <div style={{ fontSize: 16, color: '#64748b', marginBottom: 18 }}>Start shopping to place your first order!</div>
            <button
              className="hero-btn"
              style={{ fontWeight: 700, fontSize: '1.1rem', padding: '0.75rem 2.5rem', borderRadius: 999, background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.08)', marginTop: 8, cursor: 'pointer', transition: 'background 0.2s' }}
              onClick={() => navigate('/')}
              onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)'; }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="order-list">
            {sortedOrders.map((order: any) => {
              const normalizedStatus = normalizeStatus(order.status);
              const isDelivered = normalizedStatus === 'DELIVERED';
              const canCancel = normalizedStatus === 'PROCESSING';
              const statusMeta = getStatusMeta(order.status);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -3, scale: 1.015, boxShadow: '0 12px 36px rgba(99,102,241,0.13)' }}
                  className="surface-card order-card"
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for order ${order.id}`}
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="order-top">
                    <h3 className="order-id">Order #{order.id}</h3>
                    <div
                      className="order-badge"
                      style={{
                        background: statusMeta.bg,
                        color: statusMeta.color,
                        borderColor: statusMeta.color,
                      }}
                    >
                      {statusMeta.icon}
                      {statusMeta.label}
                    </div>
                  </div>
                  <OrderStatusFlow status={order.status} />
                  <div className="summary-divider" />
                  <div className="order-products">
                    {order.items.map((item: any) => (
                      <OrderProductRow
                        key={item.product.id}
                        item={item}
                        canRate={isDelivered}
                        existingReview={myReviewsByProduct[item.product.id]}
                        onRate={openRateModal}
                        onViewProduct={(productId) => navigate(`/products/${productId}`)}
                      />
                    ))}
                  </div>
                  <div className="summary-divider" />
                  <div className="order-footer">
                    <div style={{ fontSize: 15, color: '#64748b', fontWeight: 600 }}>
                      Placed on: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                    </div>
                    <div className="order-total">
                      ₹{order.total}
                    </div>
                  </div>
                  <div className="order-actions">
                    <button
                      className="primary-gradient-btn order-action-btn"
                      style={{
                        padding: '0.5rem 1.3rem',
                      }}
                      onClick={e => { e.stopPropagation(); navigate(`/orders/${order.id}`); }}
                    >
                      <Info size={16} /> View Details
                    </button>
                    {canCancel && (
                      <button
                        className="outline-danger-btn order-action-btn"
                        style={{
                          background: '#fff',
                          color: '#ef4444',
                          border: '1.5px solid #ef4444',
                          cursor: 'pointer',
                          opacity: 1,
                          padding: '0.5rem 1.3rem',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel(order.id);
                        }}
                      >
                        <XCircle size={16} /> Cancel Order
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      {showRateModal && selectedProduct && (
        <div className="review-modal-overlay" onClick={() => setShowRateModal(false)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="review-modal-title">Rate {selectedProduct.name}</h3>
            <p className="review-modal-subtitle">Share your experience after delivery.</p>

            <label className="review-label">Rating</label>
            <div className="review-stars-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`review-star-btn ${rating >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>

            <label className="review-label">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="review-textarea"
              placeholder="Write your product feedback..."
            />

            <div className="review-modal-actions">
              <button className="ghost-link-btn" onClick={() => setShowRateModal(false)}>Cancel</button>
              <button className="primary-gradient-btn" disabled={submittingReview} onClick={submitRating}>
                {submittingReview ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
