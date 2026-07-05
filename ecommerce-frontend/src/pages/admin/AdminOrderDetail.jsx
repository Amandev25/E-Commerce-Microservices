import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminGetOrder, adminUpdateOrderStatus } from '../../api/admin.js';
import { money } from '../../lib/format.js';
import { useToast } from '../../context/ToastContext.jsx';
import { StatusBadge, PaymentBadge } from '../../components/admin/StatusBadge.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { ChevronLeftIcon, UserIcon, MapPinIcon, CreditCardIcon } from '../../components/Icons.jsx';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const showToast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusDraft, setStatusDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGetOrder(id)
      .then((res) => {
        setOrder(res.data);
        setStatusDraft(res.data.status);
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSaveStatus() {
    setSaving(true);
    try {
      const res = await adminUpdateOrderStatus(id, statusDraft);
      setOrder(res.data);
      showToast(`Order marked ${statusDraft}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update status', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Skeleton className="h-96 w-full max-w-[960px]" />;
  if (!order) {
    return (
      <div className="max-w-[960px]">
        <p className="text-fog">Order not found.</p>
        <Link to="/admin/orders" className="btn-primary mt-4">Back to orders</Link>
      </div>
    );
  }

  const address = order.shippingAddress;
  const statusChanged = statusDraft !== order.status;

  return (
    <div className="max-w-[960px]">
      <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-muted hover:text-ink mb-4">
        <ChevronLeftIcon size={15} strokeWidth={2.2} /> Back to orders
      </Link>

      <div className="flex items-center gap-3 flex-wrap mb-5">
        <h2 className="font-display font-extrabold text-2xl tracking-tight">#{order._id.slice(-6).toUpperCase()}</h2>
        <StatusBadge status={order.status} />
        <PaymentBadge status={order.paymentStatus} />
        <span className="text-[13.5px] text-fog">Placed {new Date(order.createdAt).toLocaleString()}</span>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 items-start">
        {/* Items + totals */}
        <section className="bg-white border border-line rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F1EEE8]">
            <h3 className="font-display font-bold text-[15px]">Items</h3>
          </div>
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3.5 px-5 py-3.5 border-t border-[#F1EEE8]">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-tight">{item.name}</div>
                <div className="text-[12.5px] text-fog mt-0.5">{money(item.price)} × {item.quantity}</div>
              </div>
              <span className="font-display font-bold text-sm tabular-nums">{money(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="px-5 py-4 border-t border-[#F1EEE8] bg-[#FBFAF6] flex flex-col gap-2.5">
            <Row label="Subtotal" value={money(order.itemsTotal)} />
            {order.discount > 0 && (
              <Row label={`Discount (${order.couponCode})`} value={`−${money(order.discount)}`} accent />
            )}
            <div className="flex justify-between items-center pt-2.5 border-t border-[#EEEAE2]">
              <span className="font-bold text-[15px]">Total</span>
              <span className="font-display font-extrabold text-lg tabular-nums">{money(order.finalTotal)}</span>
            </div>
          </div>
        </section>

        {/* Customer + status control */}
        <div className="flex flex-col gap-4">
          <section className="bg-white border border-line rounded-2xl p-5">
            <h3 className="font-display font-bold text-[15px] mb-4">Customer</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-[42px] h-[42px] rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0">
                <UserIcon size={20} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <div className="text-[14.5px] font-semibold">{order.user?.name || '—'}</div>
                <div className="text-[12.5px] text-fog truncate">{order.user?.email || ''}</div>
              </div>
            </div>
            <InfoRow icon={<MapPinIcon size={16} strokeWidth={1.8} />} label="Ship to">
              {address.fullName}, {address.street}, {address.city} {address.postalCode} · {address.phone}
            </InfoRow>
            <InfoRow icon={<CreditCardIcon size={16} strokeWidth={1.8} />} label="Payment">
              {order.paymentStatus === 'paid' ? 'Razorpay · paid' : `Razorpay · ${order.paymentStatus}`}
            </InfoRow>
          </section>

          <section className="bg-white border border-line rounded-2xl p-5">
            <h3 className="font-display font-bold text-[15px] mb-1">Update status</h3>
            <p className="text-[12.5px] text-fog mb-3.5">Move this order through fulfillment.</p>
            <select
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value)}
              className="input cursor-pointer mb-3 capitalize"
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
            <button
              onClick={handleSaveStatus}
              disabled={!statusChanged || saving}
              className="btn-primary w-full"
            >
              {saving ? 'Saving…' : 'Save status'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex justify-between text-[13.5px]">
      <span className="text-muted">{label}</span>
      <span className={`tabular-nums font-semibold ${accent ? 'text-accent' : ''}`}>{value}</span>
    </div>
  );
}

function InfoRow({ icon, label, children }) {
  return (
    <div className="flex gap-2.5 pt-3.5 border-t border-[#F1EEE8] first:border-0 first:pt-0">
      <span className="text-mist flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <div className="text-[11px] font-bold tracking-wider text-mist uppercase mb-0.5">{label}</div>
        <div className="text-[13.5px] text-[#3A3F3B] leading-snug">{children}</div>
      </div>
    </div>
  );
}
