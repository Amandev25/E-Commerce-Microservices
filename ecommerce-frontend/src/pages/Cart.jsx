import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { applyCoupon } from '../api/coupons.js';
import { money } from '../lib/format.js';
import QuantityStepper from '../components/QuantityStepper.jsx';
import ProductImage from '../components/ProductImage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { ArrowLeftIcon, ArrowRightIcon, TrashIcon, CheckIcon, XIcon, LockIcon } from '../components/Icons.jsx';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, count, updateQuantity, remove } = useCart();
  const showToast = useToast();

  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null); // { code, discount, finalTotal }

  async function handleApplyCoupon(e) {
    e.preventDefault();
    try {
      const res = await applyCoupon(couponInput.trim());
      setCoupon(res.data);
      showToast(`Coupon ${res.data.code} applied`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid coupon', 'error');
    }
  }

  async function handleQuantity(productId, quantity) {
    try {
      await updateQuantity(productId, quantity);
      setCoupon(null); // totals changed — the coupon preview is no longer valid
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update', 'error');
    }
  }

  async function handleRemove(productId) {
    await remove(productId);
    setCoupon(null);
    showToast('Item removed');
  }

  // Guests and empty carts both see the empty state.
  if (!user || items.length === 0) {
    return (
      <div className="container-page py-8">
        <div className="card shadow-card p-10">
          <EmptyState
            title="Your cart is empty"
            subtitle={user ? 'Add something you love.' : 'Sign in and add something you love.'}
            actionLabel={user ? 'Start shopping' : 'Sign in'}
            actionTo={user ? '/products' : '/login'}
          />
        </div>
      </div>
    );
  }

  const discount = coupon?.discount || 0;
  const finalTotal = coupon ? coupon.finalTotal : total;

  return (
    <div className="container-page py-8">
      <div className="card shadow-card overflow-hidden">
        <div className="px-10 pt-9 pb-3">
          <h1 className="font-display font-bold text-[32px] tracking-tight">Your cart</h1>
          <p className="text-fog text-sm mt-1.5">{count} items · free shipping unlocked</p>
        </div>

        <div className="grid md:grid-cols-[1fr_380px] gap-8 px-10 pt-6 pb-14 items-start">
          {/* Line items */}
          <div className="border border-line2 rounded-2xl overflow-hidden">
            {items.map((item) => (
              <div key={item.product._id} className="flex items-center gap-4 px-5 py-5 border-b border-[#F1EEE8]">
                <div className="w-[88px] h-[88px] rounded-xl overflow-hidden flex-shrink-0">
                  <ProductImage product={item.product} glyphSize={36} />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product._id}`} className="text-base font-semibold hover:text-accent block truncate">
                    {item.product.name}
                  </Link>
                  <div className="text-[13px] text-fog mt-1">{money(item.priceSnapshot)} each</div>
                </div>
                <QuantityStepper
                  value={item.quantity}
                  onChange={(q) => handleQuantity(item.product._id, q)}
                  size="sm"
                />
                <div className="w-[76px] text-right font-display font-bold text-[17px]">
                  {money(item.priceSnapshot * item.quantity)}
                </div>
                <button
                  onClick={() => handleRemove(item.product._id)}
                  className="w-9 h-9 rounded-[9px] text-mist hover:bg-sale-bg hover:text-sale flex items-center justify-center flex-shrink-0"
                  aria-label="Remove item"
                >
                  <TrashIcon size={18} strokeWidth={1.9} />
                </button>
              </div>
            ))}

            <div className="px-5 py-4 flex items-center justify-between">
              <Link to="/products" className="text-sm text-accent font-semibold inline-flex items-center gap-1.5">
                <ArrowLeftIcon size={15} strokeWidth={2.2} />
                Continue shopping
              </Link>
              <span className="text-[13px] text-fog">Prices include applicable taxes</span>
            </div>
          </div>

          {/* Order summary */}
          <div className="border border-line2 rounded-2xl p-6 md:sticky md:top-5">
            <div className="font-display font-bold text-lg mb-5">Order summary</div>

            {/* Coupon */}
            <div className="mb-5">
              {coupon ? (
                <div className="flex items-center gap-2.5 bg-accent-tint rounded-xl px-3 py-2.5">
                  <CheckIcon size={16} strokeWidth={2.4} stroke="#0F6B3F" />
                  <span className="text-[13.5px] text-accent font-semibold flex-1">
                    <strong className="font-display tracking-wide">{coupon.code}</strong> applied
                  </span>
                  <button onClick={() => setCoupon(null)} className="text-accent hover:opacity-60" aria-label="Remove coupon">
                    <XIcon size={14} strokeWidth={2.4} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter coupon code"
                    className="input flex-1 py-3 font-display tracking-wide uppercase placeholder:normal-case placeholder:font-body placeholder:tracking-normal"
                  />
                  <button type="submit" className="btn-dark px-4">Apply</button>
                </form>
              )}
              <p className="text-xs text-fog mt-2">Try <strong>WELCOME15</strong> for 15% off.</p>
            </div>

            {/* Totals */}
            <div className="flex flex-col gap-3 border-t border-[#F1EEE8] pt-4 mb-4">
              <Row label="Subtotal" value={money(total)} />
              {discount > 0 && (
                <Row label={`Discount (${coupon.code})`} value={`−${money(discount)}`} valueClass="text-accent" />
              )}
              <Row label="Shipping" value="Free" valueClass="text-accent" />
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-4 mb-6">
              <span className="text-base font-bold">Total</span>
              <span className="font-display font-extrabold text-[26px] tracking-tight tabular-nums">{money(finalTotal)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout', { state: { couponCode: coupon?.code || '' } })}
              className="btn-primary w-full py-4 text-[15px]"
            >
              Proceed to checkout
              <ArrowRightIcon size={18} strokeWidth={2.2} />
            </button>
            <div className="flex items-center justify-center gap-2 mt-3.5 text-[12.5px] text-fog">
              <LockIcon size={14} strokeWidth={1.8} />
              Secure payment via Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass = '' }) {
  return (
    <div className="flex justify-between text-[14.5px]">
      <span className="text-muted">{label}</span>
      <span className={`font-semibold tabular-nums ${valueClass}`}>{value}</span>
    </div>
  );
}
