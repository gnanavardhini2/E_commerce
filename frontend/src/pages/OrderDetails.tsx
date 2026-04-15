import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { CheckCircle, Clock } from "lucide-react";
import "./Home.css";
import "./UserPanel.css";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' font-size='10' fill='%2364748b' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

const normalizeStatus = (rawStatus: string) => {
  const status = String(rawStatus || "").toUpperCase();
  if (status === "SHIPPED") return "SHIPPING";
  return status;
};

const getStatusMeta = (status: string) => {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case "PROCESSING":
      return { label: "Processing", bg: "#e0f2fe", color: "#0ea5e9", border: "#0ea5e9" };
    case "SHIPPING":
      return { label: "Shipped", bg: "#fef3c7", color: "#f59e0b", border: "#f59e0b" };
    case "DELIVERED":
      return { label: "Delivered", bg: "#dcfce7", color: "#22c55e", border: "#22c55e" };
    case "CANCELLED":
      return { label: "Cancelled", bg: "#fee2e2", color: "#ef4444", border: "#ef4444" };
    default:
      return { label: "Placed", bg: "#eef2ff", color: "#6366f1", border: "#6366f1" };
  }
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, refreshOrders } = useShop();
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = React.useState(false);
  const order = orders.find((o) => String(o.id) === id);
  const statusMeta = order ? getStatusMeta(order.status) : null;
  const normalizedStatus = order ? normalizeStatus(order.status) : "";

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!id || !token || order || hasAttemptedRefresh) return;

    const load = async () => {
      try {
        await refreshOrders();
      } finally {
        setHasAttemptedRefresh(true);
      }
    };

    load();
  }, [id, order, hasAttemptedRefresh, refreshOrders]);

  if (!order && !hasAttemptedRefresh && localStorage.getItem('token')) {
    return (
      <div className="home-bg user-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="surface-card" style={{ padding: 30, fontWeight: 700, color: '#334155' }}>
          Loading order details...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="home-bg user-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="surface-card" style={{ padding: 40, maxWidth: 420, textAlign: 'center' }}>
          <div style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 16 }}>📦</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: '#1e293b', marginBottom: 8 }}>Order Not Found</div>
          <div style={{ color: '#64748b', marginBottom: 24 }}>We couldn't find this order.</div>
          <button className="btn-primary" onClick={() => navigate('/orders')}>Back to Orders</button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-bg user-shell">
      <div className="order-detail-wrap">
        <button className="ghost-link-btn" style={{ marginBottom: 14 }} onClick={() => navigate('/orders')}>
          ← Back to Orders
        </button>
        <div className="surface-card order-detail-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 22, color: '#1e293b' }}>Order #{order.id}</div>
              <div
                className="order-badge"
                style={{ background: statusMeta?.bg, color: statusMeta?.color, borderColor: statusMeta?.border }}
              >
                {normalizedStatus === 'DELIVERED' ? (
                  <CheckCircle size={16} />
                ) : normalizedStatus === 'CANCELLED' ? (
                  <span style={{ fontWeight: 900, fontSize: 16, marginRight: 4 }}>✖</span>
                ) : (
                  <Clock size={16} />
                )}
                {statusMeta?.label}
              </div>
          </div>
          <div className="summary-divider" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {order.items.map((item) => (
              <div key={item.product.id} className="order-item-detail">
                <img
                  src={item.product.imageUrl || FALLBACK_IMAGE}
                  alt={item.product.name}
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.onerror = null;
                    img.src = FALLBACK_IMAGE;
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 16, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>x{item.quantity}</div>
                  <button
                    className="order-link-btn"
                    style={{ marginTop: 6 }}
                    onClick={() => navigate(`/products/${item.product.id}`)}
                  >
                    View Product Details
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="summary-divider" />
          <div className="order-footer">
            <div style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>
              Placed on: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
            </div>
            <div className="order-total">₹{order.total}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
