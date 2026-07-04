import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import * as cartApi from '../api/cart.js';

const CartContext = createContext(null);

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]); // [{ product, quantity, priceSnapshot }]
  const [total, setTotal] = useState(0);

  // Pull the latest cart from the server and store it locally.
  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      setTotal(0);
      return;
    }
    try {
      const res = await cartApi.getCart();
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {
      setItems([]);
      setTotal(0);
    }
  }, [user]);

  // Load the cart whenever the user logs in or out.
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Each action calls the API (which returns the updated cart) and stores it.
  async function add(productId, quantity = 1) {
    const res = await cartApi.addToCart(productId, quantity);
    setItems(res.data.items);
    setTotal(res.data.total);
  }
  async function updateQuantity(productId, quantity) {
    const res = await cartApi.updateCartItem(productId, quantity);
    setItems(res.data.items);
    setTotal(res.data.total);
  }
  async function remove(productId) {
    const res = await cartApi.removeCartItem(productId);
    setItems(res.data.items);
    setTotal(res.data.total);
  }
  async function clear() {
    await cartApi.clearCart();
    setItems([]);
    setTotal(0);
  }

  // Total number of items (sum of quantities) — used for the navbar badge.
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = { items, total, count, refresh, add, updateQuantity, remove, clear };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
