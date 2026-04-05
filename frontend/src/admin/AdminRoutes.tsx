import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import AddProductPage from './pages/AddProductPage';
import EditProductPage from './pages/EditProductPage';
import AdminOrdersPage from './pages/OrdersPage';
import UsersPage from './pages/UsersPage';
import AnalyticsPage from './pages/AnalyticsPage';


// Helper to get user from localStorage
const getUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'ADMIN') return <Navigate to="/" />;
  return <>{children}</>;
};

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/add" element={<AddProductPage />} />
        <Route path="products/edit/:id" element={<EditProductPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="dashboard" />} />
      </Route>
    </Routes>
  );
}
