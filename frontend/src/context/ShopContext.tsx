import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import API from '../api';

// Types
export type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  stock?: number;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type Order = {
  id: number;
  items: CartItem[];
  total: number;
  createdAt: string;
  status: string;
};

interface ShopContextType {
  cartItems: CartItem[];
  wishlistItems: Product[];
  orders: Order[];
  refreshOrders: () => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, delta: number) => void;
  clearCart: () => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  moveToCart: (product: Product) => void;
  placeOrder: (address: string, totalPrice: number) => Promise<{ success: boolean; message?: string }>;
  updateOrderStatus: (orderId: number, status: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  });
  const [wishlistItems, setWishlistItems] = useState<Product[]>(() => {
    const wishlist = localStorage.getItem('wishlist');
    return wishlist ? JSON.parse(wishlist) : [];
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const orders = localStorage.getItem('orders');
    return orders ? JSON.parse(orders) : [];
  });

  const mapApiOrderToUiOrder = (apiOrder: any): Order => ({
    id: Number(apiOrder.id),
    items: (apiOrder.items || []).map((item: any) => ({
      product: {
        id: Number(item.productId),
        name: item.productName,
        price: Number(item.price),
        imageUrl: item.productImageUrl || '',
      },
      quantity: Number(item.quantity),
    })),
    total: Number(apiOrder.totalPrice || 0),
    createdAt: apiOrder.createdAt,
    status: apiOrder.status,
  });

  const toErrorMessage = (payload: any, fallback: string) => {
    if (!payload) return fallback;
    if (typeof payload === 'string') return payload;
    if (typeof payload?.error === 'string' && payload.error.trim()) return payload.error;

    if (typeof payload === 'object') {
      const values = Object.values(payload)
        .filter((value) => value !== null && value !== undefined)
        .map((value) => String(value).trim())
        .filter((value) => value.length > 0);
      if (values.length > 0) return values.join(', ');
    }

    return fallback;
  };

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await API.get('/orders');
      setOrders((response.data || []).map(mapApiOrderToUiOrder));
    } catch (error) {
      console.log('Failed to load orders:', error);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const onOrderStatusUpdated = () => {
      fetchOrders();
    };

    window.addEventListener('order-status-updated', onOrderStatusUpdated);
    return () => {
      window.removeEventListener('order-status-updated', onOrderStatusUpdated);
    };
  }, [fetchOrders]);

  useEffect(() => {
    const syncCartWithLatestStock = async () => {
      try {
        const latestProductsRes = await API.get('/products');
        const latestProducts = latestProductsRes.data || [];
        const latestById = new Map<number, any>(
          latestProducts.map((p: any) => [Number(p.id), p])
        );

        setCartItems((prev) =>
          prev.length === 0
            ? prev
            : prev
            .map((item) => {
              const latest = latestById.get(Number(item.product.id));
              if (!latest) {
                return item;
              }

              const latestStock = Number(latest.stock ?? 0);
              const clampedQuantity = Math.max(1, Math.min(item.quantity, latestStock || 1));
              return {
                ...item,
                quantity: clampedQuantity,
                product: {
                  ...item.product,
                  name: latest.name,
                  price: Number(latest.price),
                  imageUrl: latest.imageUrl,
                  stock: latestStock,
                },
              };
            })
            .filter((item) => (item.product.stock ?? 0) > 0)
        );
      } catch (error) {
        console.log('Failed to sync cart stock:', error);
      }
    };

    syncCartWithLatestStock();
  }, []);

  // Cart
  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const found = prev.find((item) => item.product.id === product.id);
      if (found) {
        const maxStock = product.stock ?? Number.MAX_SAFE_INTEGER;
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, maxStock) }
            : item
        );
      }
      if ((product.stock ?? 1) <= 0) {
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };
  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };
  const updateCartQuantity = (productId: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) return item;
          const maxStock = item.product.stock ?? Number.MAX_SAFE_INTEGER;
          const nextQuantity = Math.max(1, Math.min(item.quantity + delta, maxStock));
          return { ...item, quantity: nextQuantity };
        })
        .filter((item) => item.quantity > 0)
    );
  };
  const clearCart = () => setCartItems([]);

  // Wishlist
  const addToWishlist = (product: Product) => {
    setWishlistItems((prev) =>
      prev.some((item) => item.id === product.id) ? prev : [...prev, product]
    );
  };
  const removeFromWishlist = (productId: number) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
  };
  const moveToCart = (product: Product) => {
    removeFromWishlist(product.id);
    addToCart(product);
  };

  // Orders
  const placeOrder = async (address: string, totalPrice: number) => {
    if (cartItems.length === 0) return { success: false, message: 'Cart is empty' };

    const normalizedAddress = address.trim();
    if (!normalizedAddress) {
      return { success: false, message: 'Address is required' };
    }

    try {
      const latestProductsRes = await API.get('/products');
      const latestProducts = latestProductsRes.data || [];
      const stockByProductId = new Map<number, number>(
        latestProducts.map((p: any) => [Number(p.id), Number(p.stock ?? 0)])
      );

      const outOfStockItem = cartItems.find((item) => {
        const latestStock = stockByProductId.get(Number(item.product.id));
        return latestStock !== undefined && item.quantity > latestStock;
      });

      if (outOfStockItem) {
        const latestStock = stockByProductId.get(Number(outOfStockItem.product.id)) ?? 0;
        return {
          success: false,
          message: `Only ${latestStock} item(s) left for ${outOfStockItem.product.name}. Please reduce quantity.`,
        };
      }

      const payload = {
        address: normalizedAddress,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        totalPrice,
      };
      const response = await API.post('/orders', payload);
      const createdOrder = mapApiOrderToUiOrder(response.data);
      setOrders((prev) => [createdOrder, ...prev]);
      clearCart();
      return { success: true };
    } catch (error: any) {
      const apiPayload = error?.response?.data;
      const backendMessage = toErrorMessage(apiPayload, error?.message || 'Failed to place order');
      console.log('Place order failed:', apiPayload || error);
      return { success: false, message: backendMessage };
    }
  };

  const updateOrderStatus = (orderId: number, status: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  return (
    <ShopContext.Provider
      value={{
        cartItems,
        wishlistItems,
        orders,
        refreshOrders,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        moveToCart,
        placeOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
};
