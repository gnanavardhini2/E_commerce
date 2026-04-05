import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export type AdminProduct = { id: number; name: string; price: number; active: boolean; };
export type AdminOrder = { id: number; status: string; };
export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'disabled';
};

interface AdminContextType {
  products: AdminProduct[];
  setProducts: React.Dispatch<React.SetStateAction<AdminProduct[]>>;
  orders: AdminOrder[];
  setOrders: React.Dispatch<React.SetStateAction<AdminOrder[]>>;
  users: AdminUser[];
  setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);

  return (
    <AdminContext.Provider value={{ products, setProducts, orders, setOrders, users, setUsers }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};
