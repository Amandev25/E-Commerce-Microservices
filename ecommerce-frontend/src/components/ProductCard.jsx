import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, PlusIcon } from './Icons.jsx';
import StarRating from './StarRating.jsx';
import ProductImage from './ProductImage.jsx';
import { money } from '../lib/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { add } = useCart();
  const { isWished, toggle } = useWishlist();
  const showToast = useToast();

  const categoryName =
    typeof product.category === 'object' ? product.category?.name : product.category;
  const wished = isWished(product._id);

  // Cart & wishlist need a logged-in user, so guests get sent to the login page.
  async function handleAddToCart(e) {
    e.preventDefault(); // don't follow the card's link
    if (!user) return navigate('/login');
    try {
      await add(product._id, 1);
      showToast('Added to cart');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add to cart', 'error');
    }
  }

  async function handleToggleWishlist(e) {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      const nowWished = await toggle(product._id);
      showToast(nowWished ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {
      showToast('Something went wrong', 'error');
    }
  }

  return (
    <Link
      to={`/products/${product._id}`}
      className="group relative block bg-white border border-line2 rounded-2xl overflow-hidden transition-shadow hover:border-line3 hover:shadow-hover"
    >
      {/* Image / icon tile */}
      <div className="relative aspect-square">
        <ProductImage product={product} />

        {/* Out-of-stock tag */}
        {product.stock === 0 && (
          <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-sale-bg text-sale">
            Sold out
          </span>
        )}

        {/* Wishlist heart */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full border border-line2 bg-white/90 flex items-center justify-center hover:bg-white"
          aria-label="Toggle wishlist"
        >
          <HeartIcon size={18} strokeWidth={1.9} filled={wished} stroke={wished ? '#0F6B3F' : '#131614'} />
        </button>
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="text-xs text-fog mb-1.5">{categoryName}</div>
        <div className="text-[15px] font-semibold leading-tight mb-2 line-clamp-1">{product.name}</div>

        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={product.averageRating || 0} />
          <span className="text-xs text-fog">
            {Number(product.averageRating || 0).toFixed(1)} ({product.numReviews || 0})
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-lg font-bold">{money(product.price)}</span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-9 h-9 rounded-[10px] bg-ink text-white flex items-center justify-center hover:bg-accent disabled:opacity-40"
            aria-label="Add to cart"
          >
            <PlusIcon size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
}
