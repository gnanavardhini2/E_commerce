import React, { useState } from "react";

import { ShoppingCart, Trash, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useShop } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import "./UserPanel.css";

type AddressState = {
  name: string;
  phone: string;
  line: string;
  city: string;
  state: string;
  pincode: string;
};

const CartPage = () => {
  const { cartItems, updateCartQuantity, removeFromCart, placeOrder } = useShop();
  const navigate = useNavigate();
  // Calculate total items and subtotal
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const delivery = subtotal > 0 ? 0 : 0;
  const discount = subtotal > 1000 ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal - discount + delivery;

  // Fallback image for products
  const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' font-size='12' fill='%2364748b' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
  // Example product details (replace with real data if available)
  type CartItem = { product: { stock?: number; seller?: string; [key: string]: any }; [key: string]: any };
  const getStock = (item: CartItem) => item.product.stock ?? 0;
  const getSeller = (item: CartItem) => item.product.seller ?? "MyShop Retail";
  // Delivery date (simulate for demo)
  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 4);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  const [imgError, setImgError] = useState<Record<number, boolean>>({});
  const [showAddress, setShowAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [address, setAddress] = useState<AddressState>({
    name: "",
    phone: "",
    line: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [addressErrors, setAddressErrors] = useState<Partial<AddressState>>({});

  const validateAddress = (value: AddressState) => {
    const errors: Partial<AddressState> = {};
    if (!value.name.trim()) errors.name = "Full Name is required";
    if (!value.phone.trim()) errors.phone = "Phone Number is required";
    if (!value.line.trim()) errors.line = "Address Line is required";
    if (!value.city.trim()) errors.city = "City is required";
    if (!value.state.trim()) errors.state = "State is required";
    if (!value.pincode.trim()) errors.pincode = "Pincode is required";
    return errors;
  };

  const isAddressValid = Object.keys(validateAddress(address)).length === 0;

  const openAddressSidebar = () => {
    setAddressErrors({});
    setShowAddress(true);
  };

  const handleAddressChange = (field: keyof AddressState, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    setAddressErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePlaceOrder = async () => {
    const errors = validateAddress(address);
    setAddressErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const fullAddress = `${address.name}, ${address.phone}, ${address.line}, ${address.city}, ${address.state} - ${address.pincode}`;

    setPlacingOrder(true);
    const result = await placeOrder(fullAddress, total);
    setPlacingOrder(false);

    if (!result.success) {
      alert(result.message || "Failed to place order");
      return;
    }

    setShowAddress(false);
    setAddress({ name: "", phone: "", line: "", city: "", state: "", pincode: "" });
    alert("Order placed successfully");
    navigate('/orders');
  };

  return (
    <div className="home-bg user-shell">
      <div className="user-container">
        <h2 className="user-page-title">Your Cart</h2>
        <p className="user-page-subtitle" style={{ marginBottom: 14 }}>Review your selected items before checkout.</p>
        <a href="/" className="ghost-link-btn">← Continue Shopping</a>
        {cartItems.length === 0 ? (
          <div className="empty-state" style={{ minHeight: 360, marginTop: 18 }}>
            <ShoppingCart className="empty-state-icon" />
            <div className="empty-state-title">Your cart is empty</div>
            <div className="empty-state-subtext">Looks like you haven't added anything yet.</div>
            <button
              className="primary-gradient-btn"
              style={{ marginTop: 20, padding: '0.7rem 2rem', fontSize: '1rem' }}
              onClick={() => window.location.href = '/'}
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-list">
              {cartItems.map((item) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, type: 'spring', stiffness: 80 }}
                  whileHover={{ y: -2, boxShadow: "0 14px 30px rgba(79, 70, 229, 0.14)" }}
                  className="surface-card cart-item"
                >
                  {(() => {
                    const stock = getStock(item);
                    const atMaxStock = item.quantity >= stock;
                    return (
                      <>
                        <img
                          src={imgError[item.product.id] ? FALLBACK_IMAGE : item.product.imageUrl || FALLBACK_IMAGE}
                          alt={item.product.name}
                          className="cart-item-image"
                          onError={() => {
                            if (!imgError[item.product.id]) {
                              setImgError((prev) => ({ ...prev, [item.product.id]: true }));
                            }
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <h3 className="cart-item-name">{item.product.name}</h3>
                          <div className="cart-item-price">₹{item.product.price}</div>
                          <div className="cart-item-meta">In stock: {getStock(item)}</div>
                          {atMaxStock && <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 13 }}>Max available quantity reached</div>}
                          <div className="cart-item-meta">Seller: {getSeller(item)}</div>
                          <div style={{ color: '#16a34a', fontWeight: 700, fontSize: 14, marginTop: 2 }}>
                            Free delivery by <span style={{ color: '#4f46e5' }}>{getDeliveryDate()}</span>
                          </div>
                        </div>
                        <div className="cart-qty">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="cart-qty-btn"
                            onClick={() => updateCartQuantity(item.product.id, -1)}
                            title="Decrease quantity"
                          >
                            <Minus size={18} />
                          </motion.button>
                          <span className="cart-qty-value">{item.quantity}</span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="cart-qty-btn"
                            disabled={atMaxStock}
                            onClick={() => updateCartQuantity(item.product.id, 1)}
                            title="Increase quantity"
                          >
                            <Plus size={18} />
                          </motion.button>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(item.product.id)}
                          title="Remove from cart"
                        >
                          <Trash size={19} />
                        </motion.button>
                      </>
                    );
                  })()}
                </motion.div>
              ))}
            </div>
            <div className="surface-card summary-card">
              <h3 className="summary-title">Order Summary</h3>
              <div className="summary-divider" />
              <div className="summary-row">
                  <span>Total Items</span>
                  <span>{totalItems}</span>
              </div>
              <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
              </div>
              <div className="summary-row">
                  <span>Delivery</span>
                  <span>{delivery === 0 ? 'Free' : `₹${delivery}`}</span>
              </div>
              <div className="summary-row" style={{ color: '#16a34a' }}>
                  <span>Discount</span>
                  <span>-₹{discount}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-total">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              {discount > 0 && (
                <div style={{ color: '#16a34a', fontWeight: 700, fontSize: 14, marginBottom: 4, textAlign: 'right' }}>
                  You saved ₹{discount} on this order
                </div>
              )}
              <div className="summary-trust">Free delivery by {getDeliveryDate()}</div>
              <div style={{ marginTop: 8, fontSize: 14, color: '#4f46e5', fontWeight: 700 }}>Secure checkout and safe payment</div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="primary-gradient-btn"
                style={{ width: '100%', marginTop: 12, padding: '0.92rem 1rem', fontSize: '1.05rem' }}
                onClick={openAddressSidebar}
              >
                Checkout
              </motion.button>
            </div>
          </div>
        )}

        {showAddress && (
          <>
            <div
              onClick={() => setShowAddress(false)}
              className="sidebar-scrim"
            />
            <div
              className="address-sidebar"
            >
              <h2 style={{ margin: 0, fontSize: 24, color: '#1e293b', fontWeight: 800 }}>Enter Delivery Address</h2>

              <label className="address-label">Full Name</label>
              <input
                placeholder="Full Name"
                value={address.name}
                onChange={(e) => handleAddressChange('name', e.target.value)}
                className="address-input"
              />
              {addressErrors.name && <div className="address-error">{addressErrors.name}</div>}

              <label className="address-label">Phone Number</label>
              <input
                placeholder="Phone Number"
                value={address.phone}
                onChange={(e) => handleAddressChange('phone', e.target.value)}
                className="address-input"
              />
              {addressErrors.phone && <div className="address-error">{addressErrors.phone}</div>}

              <label className="address-label">Address Line</label>
              <input
                placeholder="Address Line"
                value={address.line}
                onChange={(e) => handleAddressChange('line', e.target.value)}
                className="address-input"
              />
              {addressErrors.line && <div className="address-error">{addressErrors.line}</div>}

              <label className="address-label">City</label>
              <input
                placeholder="City"
                value={address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="address-input"
              />
              {addressErrors.city && <div className="address-error">{addressErrors.city}</div>}

              <label className="address-label">State</label>
              <input
                placeholder="State"
                value={address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className="address-input"
              />
              {addressErrors.state && <div className="address-error">{addressErrors.state}</div>}

              <label className="address-label">Pincode</label>
              <input
                placeholder="Pincode"
                value={address.pincode}
                onChange={(e) => handleAddressChange('pincode', e.target.value)}
                className="address-input"
              />
              {addressErrors.pincode && <div className="address-error">{addressErrors.pincode}</div>}

              <button
                onClick={handlePlaceOrder}
                disabled={!isAddressValid || placingOrder}
                className="primary-gradient-btn"
                style={{
                  marginTop: 12,
                  padding: '0.8rem 1.2rem',
                  fontWeight: 800,
                  background: isAddressValid && !placingOrder ? 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)' : '#cbd5e1',
                  color: '#fff',
                  cursor: isAddressValid && !placingOrder ? 'pointer' : 'not-allowed',
                }}
              >
                {placingOrder ? 'Placing...' : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
