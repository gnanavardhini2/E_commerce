import React, { useState } from 'react';
import API from '../api';

import { useNavigate } from 'react-router-dom';
import './Home.css';
import './UserPanel.css';

const CheckoutPage = () => {
  const [address, setAddress] = useState('');
  const navigate = useNavigate();

  const handleCheckout = () => {
    API.post('/orders', { address }).then(() => {
      API.delete('/cart/clear');
      navigate('/orders');
    });
  };

  return (
    <div className="user-shell home-bg">
      <div className="checkout-wrap">
        <div className="surface-card checkout-card">
          <h2 className="user-page-title" style={{ marginBottom: 6 }}>Checkout</h2>
          <p className="user-page-subtitle" style={{ marginBottom: 16 }}>
            Add your delivery address to place the order.
          </p>
          <textarea
            className="checkout-input"
            placeholder="Enter full delivery address"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
          <button
            onClick={handleCheckout}
            className="primary-gradient-btn"
            style={{ marginTop: 14, padding: '0.75rem 1.6rem', fontSize: '1rem' }}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
