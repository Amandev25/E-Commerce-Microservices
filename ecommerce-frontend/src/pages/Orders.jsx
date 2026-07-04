import { useState, useEffect } from 'react';
import { getMyOrders } from '../api/orders.js';
import { money } from '../lib/format.js';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';

// Colours for each order status, matching the design's status badges.
const STATUS_STYLES = {
  pending: 'bg-[#FBF3E2] text-[#9A6B12]',
  processing: 'bg-[#EAF0FB] text-[#2E5AAC]',
  shipped: 'bg-[#EDEBF9] text-[#5B3FB0]',
  delivered: 'bg-accent-tint text-accent',
  cancelled: 'bg-sale-bg text-sale',
};

const PAYMENT_STYLES = {
  paid: 'bg-accent-tint text-accent',
  unpaid: 'bg-[#F1EEE8] text-fog',
  failed: 'bg-sale-bg text-sale',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page py-8">
      <div className="card shadow-card overflow-hidden">
        <div className="px-10 pt-9 pb-3">
          <h1 className="font-display font-bold text-[32px] tracking-tight">Your orders</h1>
          <p className="text-fog text-sm mt-1.5">Track everything you've bought.</p>
        </div>

        <div className="px-10 pt-6 pb-14">
          {loading ? (
            <div className="flex flex-col gap-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <EmptyState title="No orders yet" subtitle="When you place an order, it'll show up here." actionLabel="Start shopping" actionTo="/products" />
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  return (
    <div className="border border-line2 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <div className="text-[13px] text-fog">Order #{order._id.slice(-8).toUpperCase()}</div>
          <div className="text-sm text-muted mt-1">{new Date(order.createdAt).toLocaleString()}</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={STATUS_STYLES[order.status]}>{order.status}</Badge>
          <Badge className={PAYMENT_STYLES[order.paymentStatus]}>{order.paymentStatus}</Badge>
        </div>
      </div>

      <div className="border-t border-[#F1EEE8] pt-4 flex flex-col gap-2">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-muted">
              {item.name} × {item.quantity}
            </span>
            <span className="font-semibold tabular-nums">{money(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-[#F1EEE8] mt-4 pt-4 flex items-baseline justify-between">
        <span className="text-sm text-muted">
          {order.couponCode ? `Coupon ${order.couponCode} · −${money(order.discount)}` : 'No coupon'}
        </span>
        <span className="font-display font-bold text-xl">{money(order.finalTotal)}</span>
      </div>
    </div>
  );
}

function Badge({ children, className = '' }) {
  return (
    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${className}`}>
      ● {children}
    </span>
  );
}
