import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== "ADMIN") return <Navigate to="/" />;
  return <>{children}</>;
};

export default AdminRoute;
