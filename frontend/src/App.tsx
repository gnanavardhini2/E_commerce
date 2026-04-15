
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';


import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetails from './pages/OrderDetails';
import Layout from './components/Layout';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';
import AdminLayout from './admin/components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';



import { AdminProvider } from './admin/context/AdminContext';

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <Toaster position="top-right" toastOptions={{ duration: 2500 }} />
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route element={<Layout />}>
              <Route path="/orders/:id" element={<OrderDetails />} />
            </Route>

            {/* Protected user dashboard (HomePage) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/orders" element={<OrdersPage />} />
              </Route>
            </Route>

            {/* Admin Routes - strictly separated */}
            <Route
              path="/admin"
              element={
                <AdminProvider>
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                </AdminProvider>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="users" element={<UserManagement />} />
            </Route>

            {/* Direct admin dashboard route for strict separation */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminProvider>
                  <AdminRoute>
                    <AdminLayout />
                    <AdminDashboard />
                  </AdminRoute>
                </AdminProvider>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminProvider>
                  <AdminRoute>
                    <AdminLayout />
                    <ProductManagement />
                  </AdminRoute>
                </AdminProvider>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminProvider>
                  <AdminRoute>
                    <AdminLayout />
                    <OrderManagement />
                  </AdminRoute>
                </AdminProvider>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminProvider>
                  <AdminRoute>
                    <AdminLayout />
                    <UserManagement />
                  </AdminRoute>
                </AdminProvider>
              }
            />

            {/* Fallback: no redirect to user panel from admin paths */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;
