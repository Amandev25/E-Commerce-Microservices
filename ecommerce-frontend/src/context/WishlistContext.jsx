import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import * as wishlistApi from '../api/wishlist.js';

const WishlistContext = createContext(null);

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  // We store just the product ids that are in the wishlist (as strings).
  const [ids, setIds] = useState([]);

  // Load the wishlist whenever the logged-in user changes.
  useEffect(() => {
    if (!user) {
      setIds([]);
      return;
    }
    wishlistApi
      .getWishlist()
      .then((res) => {
        const products = res.data.products || [];
        // products can be full objects or ids — normalise to id strings.
        setIds(products.map((p) => (typeof p === 'string' ? p : p._id)));
      })
      .catch(() => setIds([]));
  }, [user]);

  const isWished = useCallback((productId) => ids.includes(productId), [ids]);

  // Add/remove a product. Returns true if it's now wished, false if removed.
  async function toggle(productId) {
    const res = await wishlistApi.toggleWishlist(productId);
    const newIds = (res.data || []).map((p) => (typeof p === 'string' ? p : p._id));
    setIds(newIds);
    return newIds.includes(productId);
  }

  const value = { ids, count: ids.length, isWished, toggle };
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
