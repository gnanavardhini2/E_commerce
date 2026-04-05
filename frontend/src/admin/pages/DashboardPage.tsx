import React from 'react';

export default function DashboardPage() {
  // Placeholder stats
  return (
    <div>
      <h2 style={{ fontWeight: 900, fontSize: 28, marginBottom: 24 }}>Dashboard</h2>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-title">Total Products</div>
          <div className="admin-stat-value">120</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-title">Total Orders</div>
          <div className="admin-stat-value">350</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-title">Revenue</div>
          <div className="admin-stat-value">₹2,50,000</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-title">Users</div>
          <div className="admin-stat-value">80</div>
        </div>
      </div>
    </div>
  );
}
