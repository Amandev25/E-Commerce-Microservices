import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { placeOrder } from '../api/orders.js';
import { createPaymentOrder, verifyPayment } from '../api/payments.js';
import { applyCoupon } from '../api/coupons.js';
import { money } from '../lib/format.js';
import EmptyState from '../components/EmptyState.jsx';
import { LockIcon, ArrowLeftIcon } from '../components/Icons.jsx';

// Loads Razorpay's checkout script once, on demand.
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const EMPTY_ADDRESS = { fullName: '', phone: '', street: '', city: '', postalCode: '' };

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, refresh } = useCart();
  const showToast = useToast();

  const couponCode = location.state?.couponCode || '';
  const [address, setAddress] = useState({ ...EMPTY_ADDRESS, fullName: user?.name || '' });
  const [discount, setDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);

  // If a coupon was applied on the cart page, preview its discount here too.
  useEffect(() => {
    if (!couponCode || items.length === 0) return;
    applyCoupon(couponCode)
      .then((res) => setDiscount(res.data.discount))
      .catch(() => setDiscount(0));
  }, [couponCode, items.length]);

  if (items.length === 0) {
    return (
      <div className="container-page py-8">
        <div className="card shadow-card p-10">
          <EmptyState title="Your cart is empty" subtitle="Add items before checking out." actionLabel="Shop products" actionTo="/products" />
        </div>
      </div>
    );
  }

  function setField(key, value) {
    setAddress((a) => ({ ...a, [key]: value }));
  }

  function isValid() {
    return Object.values(address).every((v) => v.trim() !== '');
  }

  async function handlePlaceOrder() {
    if (!isValid()) return showToast('Please fill in every address field', 'error');
    setPlacing(true);
    try {
      // 1) Create the order from the cart (this decrements stock & empties the cart).
      const orderRes = await placeOrder({ shippingAddress: address, couponCode });
      const order = orderRes.data;
      await refresh(); // update the navbar cart badge

      // 2) Create a Razorpay order and open the payment popup.
      const payRes = await createPaymentOrder(order._id);
      const { razorpayOrderId, amount, currency, key } = payRes.data;

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        showToast('Payment SDK failed to load — order saved as unpaid', 'error');
        return navigate('/orders');
      }

      const razorpay = new window.Razorpay({
        key,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: 'Marlowe',
        description: `Order ${order._id}`,
        prefill: { name: user.name, email: user.email },
        theme: { color: '#0F6B3F' },
        // 3) When payment succeeds, verify the signature on our backend.
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            showToast('Payment successful — thank you!');
          } catch {
            showToast('Payment verification failed', 'error');
          }
          navigate('/orders');
        },
        modal: {
          ondismiss: () => {
            showToast('Payment cancelled — order saved as unpaid');
            navigate('/orders');
          },
        },
      });
      razorpay.open();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not place order', 'error');
    } finally {
      setPlacing(false);
    }
  }

  const finalTotal = total - discount;

  return (
    <div className="container-page py-8">
      <div className="card shadow-card overflow-hidden">
        <div className="px-10 pt-9 pb-3">
          <Link to="/cart" className="text-[13px] text-fog hover:text-ink inline-flex items-center gap-1.5 mb-2">
            <ArrowLeftIcon size={14} strokeWidth={2.2} />
            Back to cart
          </Link>
          <h1 className="font-display font-bold text-[32px] tracking-tight">Checkout</h1>
        </div>

        <div className="grid md:grid-cols-[1fr_380px] gap-8 px-10 pt-6 pb-14 items-start">
          {/* Shipping address */}
          <div className="border border-line2 rounded-2xl p-6">
            <div className="font-display font-bold text-lg mb-5">Shipping address</div>
            <div className="grid gap-4">
              <Field label="Full name" value={address.fullName} onChange={(v) => setField('fullName', v)} />
              <Field label="Phone" value={address.phone} onChange={(v) => setField('phone', v)} />
              <Field label="Street address" value={address.street} onChange={(v) => setField('street', v)} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" value={address.city} onChange={(v) => setField('city', v)} />
                <Field label="Postal code" value={address.postalCode} onChange={(v) => setField('postalCode', v)} />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="border border-line2 rounded-2xl p-6 md:sticky md:top-5">
            <div className="font-display font-bold text-lg mb-5">Order summary</div>

            <div className="flex flex-col gap-3 mb-4">
              {items.map((item) => (
                <div key={item.product._id} className="flex justify-between text-sm">
                  <span className="text-muted truncate pr-2">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-semibold tabular-nums">{money(item.priceSnapshot * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-[#F1EEE8] pt-4 mb-4">
              <Row label="Subtotal" value={money(total)} />
              {discount > 0 && <Row label={`Discount (${couponCode})`} value={`−${money(discount)}`} valueClass="text-accent" />}
              <Row label="Shipping" value="Free" valueClass="text-accent" />
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-4 mb-6">
              <span className="text-base font-bold">Total</span>
              <span className="font-display font-extrabold text-[26px] tracking-tight tabular-nums">{money(finalTotal)}</span>
            </div>

            <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary w-full py-4 text-[15px]">
              {placing ? 'Placing order…' : 'Place order & pay'}
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

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-[13px] font-semibold mb-1.5 block">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="input" />
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
