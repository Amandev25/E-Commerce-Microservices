import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../api/products.js';
import { getProductReviews, addReview } from '../api/reviews.js';
import { money, starWidth, initials } from '../lib/format.js';
import StarRating from '../components/StarRating.jsx';
import QuantityStepper from '../components/QuantityStepper.jsx';
import ProductImage from '../components/ProductImage.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { ProductGlyph, BagIcon, HeartIcon, TruckIcon, RefreshIcon, ShieldIcon } from '../components/Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { add } = useCart();
  const { isWished, toggle } = useWishlist();
  const showToast = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  // Load the product + its reviews. Runs again if the id in the URL changes.
  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    Promise.all([getProduct(id), getProductReviews(id)])
      .then(([productRes, reviewsRes]) => {
        setProduct(productRes.data);
        setReviews(reviewsRes.data);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    if (!user) return navigate('/login');
    try {
      await add(product._id, qty);
      showToast('Added to cart');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add to cart', 'error');
    }
  }

  async function handleToggleWishlist() {
    if (!user) return navigate('/login');
    const nowWished = await toggle(product._id);
    showToast(nowWished ? 'Added to wishlist' : 'Removed from wishlist');
  }

  // Called by the review form after a successful submit — reload both.
  async function reloadAfterReview() {
    const [productRes, reviewsRes] = await Promise.all([getProduct(id), getProductReviews(id)]);
    setProduct(productRes.data);
    setReviews(reviewsRes.data);
  }

  if (loading) return <DetailSkeleton />;
  if (!product) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-fog">Product not found.</p>
        <Link to="/products" className="btn-primary mt-5">Back to products</Link>
      </div>
    );
  }

  const categoryName = typeof product.category === 'object' ? product.category?.name : '';
  const inStock = product.stock > 0;
  const wished = isWished(product._id);

  return (
    <div className="container-page py-8">
      <div className="card shadow-card overflow-hidden">
        {/* Breadcrumb */}
        <div className="px-10 pt-7 pb-3 text-[13px] text-fog">
          <Link to="/" className="hover:text-ink">Home</Link> &nbsp;/&nbsp;{' '}
          {categoryName} &nbsp;/&nbsp; <span className="text-ink">{product.name}</span>
        </div>

        {/* Top: gallery + info */}
        <div className="grid md:grid-cols-2 gap-11 px-10 pt-3 pb-11">
          {/* Gallery */}
          <div>
            <div className="aspect-square bg-[#EBEEF0] rounded-[18px] flex items-center justify-center overflow-hidden">
              <ProductImage product={product} glyphSize={150} />
            </div>
            <div className="grid grid-cols-4 gap-3 mt-3">
              {(product.images && product.images.length > 0
                ? product.images.slice(0, 4)
                : [0, 1, 2, 3]
              ).map((img, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-xl flex items-center justify-center cursor-pointer overflow-hidden ${
                    i === 0 ? 'bg-accent-tint border-2 border-accent' : 'bg-cream border border-line2'
                  }`}
                >
                  {typeof img === 'string' ? (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ProductGlyph category={categoryName} size={30} color={i === 0 ? '#0F6B3F' : '#B0AB9E'} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="text-[13px] font-semibold tracking-wide uppercase text-accent mb-2.5">{categoryName}</div>
            <h1 className="font-display font-bold text-[34px] tracking-tight leading-tight mb-3.5">{product.name}</h1>

            <div className="flex items-center gap-2.5 mb-5">
              <StarRating rating={product.averageRating} size={16} />
              <span className="text-sm font-semibold">{Number(product.averageRating).toFixed(1)}</span>
              <span className="text-sm text-fog">· {product.numReviews} reviews</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="font-display font-extrabold text-[34px] tracking-tight">{money(product.price)}</span>
            </div>

            {inStock ? (
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-accent mb-6">
                <span className="w-2 h-2 rounded-full bg-accent" />
                In stock · {product.stock} available
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-sale mb-6">
                <span className="w-2 h-2 rounded-full bg-sale" />
                Out of stock
              </div>
            )}

            <p className="text-[15px] leading-relaxed text-muted mb-7">{product.description}</p>

            {/* Quantity + actions */}
            <div className="flex items-center gap-3.5 mb-4">
              <span className="text-sm font-semibold">Quantity</span>
              <QuantityStepper value={qty} onChange={setQty} size="md" />
            </div>
            <div className="flex gap-3 mb-6">
              <button onClick={handleAddToCart} disabled={!inStock} className="btn-primary flex-1 py-4 text-[15px]">
                <BagIcon size={19} />
                {inStock ? 'Add to cart' : 'Out of stock'}
              </button>
              <button
                onClick={handleToggleWishlist}
                className="w-14 border border-line3 rounded-xl bg-white text-ink hover:border-accent hover:text-accent flex items-center justify-center"
                aria-label="Toggle wishlist"
              >
                <HeartIcon size={20} strokeWidth={1.9} filled={wished} stroke={wished ? '#0F6B3F' : 'currentColor'} />
              </button>
            </div>

            {/* Trust row */}
            <div className="flex gap-5 border-t border-[#F1EEE8] pt-5 flex-wrap">
              <Trust icon={<TruckIcon size={18} strokeWidth={1.8} stroke="#0F6B3F" />} label="Free shipping" />
              <Trust icon={<RefreshIcon size={18} strokeWidth={1.8} stroke="#0F6B3F" />} label="30-day returns" />
              <Trust icon={<ShieldIcon size={18} strokeWidth={1.8} stroke="#0F6B3F" />} label="Secure checkout" />
            </div>
          </div>
        </div>

        {/* Description + Reviews */}
        <div className="border-t border-[#F1EEE8] p-10 bg-[#FBFAF6]">
          <div className="max-w-[760px] mb-11">
            <h3 className="font-display font-bold text-[22px] tracking-tight mb-3.5">Description</h3>
            <p className="text-[15.5px] leading-[1.7] text-muted">{product.description}</p>
          </div>

          <h3 className="font-display font-bold text-[22px] tracking-tight mb-5">Reviews</h3>
          <div className="grid md:grid-cols-[280px_1fr] gap-11 items-start">
            <ReviewSummary product={product} reviews={reviews} />
            <div>
              <ReviewList reviews={reviews} />
              <ReviewForm productId={product._id} onSubmitted={reloadAfterReview} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Trust({ icon, label }) {
  return (
    <div className="flex items-center gap-2.5 text-[13px] text-muted">
      {icon}
      {label}
    </div>
  );
}

// Left column of the reviews section: big rating + star distribution bars.
function ReviewSummary({ product, reviews }) {
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const pct = reviews.length ? (count / reviews.length) * 100 : 0;
    return { star, count, pct };
  });

  return (
    <div className="border border-line2 rounded-2xl p-6 bg-white">
      <div className="font-display font-extrabold text-5xl tracking-tight leading-none">
        {Number(product.averageRating).toFixed(1)}
      </div>
      <div className="my-2.5 inline-block">
        <StarRating rating={product.averageRating} size={16} />
      </div>
      <div className="text-[13px] text-fog mb-5">Based on {product.numReviews} reviews</div>
      {distribution.map((d) => (
        <div key={d.star} className="flex items-center gap-2.5 mb-2.5">
          <span className="text-xs text-muted w-6">{d.star} ★</span>
          <div className="flex-1 h-[7px] bg-[#EFEDE8] rounded-full overflow-hidden">
            <div className="h-full bg-star rounded-full" style={{ width: `${d.pct}%` }} />
          </div>
          <span className="text-xs text-mist w-7 text-right">{d.count}</span>
        </div>
      ))}
    </div>
  );
}

// Middle/right: the list of written reviews.
function ReviewList({ reviews }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-fog mb-8">No reviews yet — be the first to review this product.</p>;
  }
  const palette = ['#0F6B3F', '#8A6D3B', '#2E5AAC', '#5B3FB0'];
  return (
    <div className="flex flex-col gap-5 mb-8">
      {reviews.map((r, i) => (
        <div key={r._id} className="border-b border-[#F1EEE8] pb-5">
          <div className="flex items-center gap-3 mb-2.5">
            <span
              className="w-[38px] h-[38px] rounded-full text-white font-bold text-[15px] flex items-center justify-center flex-shrink-0"
              style={{ background: palette[i % palette.length] }}
            >
              {initials(r.user?.name || 'User')}
            </span>
            <div className="flex-1">
              <div className="text-[14.5px] font-semibold">{r.user?.name || 'User'}</div>
              <div className="text-xs text-mist">{new Date(r.createdAt).toLocaleDateString()}</div>
            </div>
            <StarRating rating={r.rating} />
          </div>
          {r.comment && <p className="text-[14.5px] leading-relaxed text-muted">{r.comment}</p>}
        </div>
      ))}
    </div>
  );
}

// The "write a review" form. Only shown to logged-in users.
function ReviewForm({ productId, onSubmitted }) {
  const { user } = useAuth();
  const showToast = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="border border-line2 rounded-2xl p-6 bg-white text-center">
        <p className="text-sm text-muted">
          <Link to="/login" className="text-accent font-semibold">Sign in</Link> to write a review.
        </p>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addReview(productId, { rating, comment });
      setComment('');
      setRating(5);
      showToast('Review added');
      await onSubmitted();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add review', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line2 rounded-2xl p-6 bg-white">
      <div className="font-display font-bold text-base mb-1">Write a review</div>
      <div className="text-[13px] text-fog mb-4">Signed in as {user.name} · share your experience</div>

      {/* Clickable star rating */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-semibold">Your rating</span>
        <div className="flex text-[22px] tracking-[3px] cursor-pointer select-none">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              onClick={() => setRating(n)}
              className={n <= rating ? 'text-star' : 'text-[#DFDCD3]'}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Tell others what you liked or didn't…"
        className="input min-h-[88px] mb-4 resize-y"
      />
      <button type="submit" disabled={submitting} className="btn-dark">
        {submitting ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  );
}

function DetailSkeleton() {
  return (
    <div className="container-page py-8">
      <div className="card shadow-card overflow-hidden p-10">
        <div className="grid md:grid-cols-2 gap-11">
          <Skeleton className="aspect-square" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
