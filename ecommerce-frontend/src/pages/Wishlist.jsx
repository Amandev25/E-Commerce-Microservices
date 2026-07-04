import { useState, useEffect } from 'react';
import { getWishlist } from '../api/wishlist.js';
import { useWishlist } from '../context/WishlistContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { ProductGridSkeleton } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { HeartIcon } from '../components/Icons.jsx';

export default function Wishlist() {
  const { ids } = useWishlist(); // re-fetch when the wishlist changes
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWishlist()
      .then((res) => setProducts(res.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [ids.length]);

  return (
    <div className="container-page py-8">
      <div className="card shadow-card overflow-hidden">
        <div className="px-10 pt-9 pb-3">
          <h1 className="font-display font-bold text-[32px] tracking-tight">Your wishlist</h1>
          <p className="text-fog text-sm mt-1.5">Things you've saved for later.</p>
        </div>

        <div className="px-10 pt-6 pb-14">
          {loading ? (
            <ProductGridSkeleton count={4} columns={4} />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<HeartIcon size={34} strokeWidth={1.6} stroke="#C7C3B8" />}
              title="Your wishlist is empty"
              subtitle="Tap the heart on any product to save it here."
              actionLabel="Browse products"
              actionTo="/products"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
