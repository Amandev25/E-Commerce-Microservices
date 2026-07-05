import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminGetOrders } from '../../api/admin.js';
import { money } from '../../lib/format.js';
import { StatusBadge, PaymentBadge } from '../../components/admin/StatusBadge.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { ChevronRightIcon } from '../../components/Icons.jsx';

const STATUS_OPTIONS = ['All', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_OPTIONS = ['All', 'unpaid', 'paid', 'failed'];

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('All');
  const [payment, setPayment] = useState('All');

  useEffect(() => {
    adminGetOrders()
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  // Filtering happens on the client — the admin orders list is small.
  const filtered = orders.filter(
    (o) => (status === 'All' || o.status === status) && (payment === 'All' || o.paymentStatus === payment)
  );

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <Filter label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        <Filter label="Payment" value={payment} onChange={setPayment} options={PAYMENT_OPTIONS} />
        <div className="flex-1" />
        <span className="text-[13px] text-fog font-medium">{filtered.length} orders</span>
      </div>

      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#FBFAF6] border-b border-[#EEEAE2]">
                <Th className="pl-5">Order</Th>
                <Th>Customer</Th>
                <Th>Date</Th>
                <Th className="text-right">Total</Th>
                <Th>Payment</Th>
                <Th>Status</Th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-6"><Skeleton className="h-40 w-full" /></td></tr>
              ) : (
                filtered.map((o) => (
                  <tr
                    key={o._id}
                    onClick={() => navigate(`/admin/orders/${o._id}`)}
                    className="border-t border-[#F1EEE8] cursor-pointer hover:bg-[#FBFAF6]"
                  >
                    <td className="px-5 py-3.5 font-display font-bold text-[13.5px] whitespace-nowrap">#{o._id.slice(-6).toUpperCase()}</td>
                    <td className="px-3 py-3.5">
                      <div className="text-sm font-semibold whitespace-nowrap">{o.user?.name || '—'}</div>
                      <div className="text-xs text-mist mt-0.5">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</div>
                    </td>
                    <td className="px-3 py-3.5 text-[13.5px] text-muted whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-3.5 text-right font-display font-bold text-sm tabular-nums whitespace-nowrap">{money(o.finalTotal)}</td>
                    <td className="px-3 py-3.5"><PaymentBadge status={o.paymentStatus} /></td>
                    <td className="px-3 py-3.5"><StatusBadge status={o.status} /></td>
                    <td className="px-3 py-3.5 text-[#C9C4B8]"><ChevronRightIcon size={17} strokeWidth={2.2} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="py-14 text-center">
            <div className="font-display font-bold text-base mb-1">No orders match</div>
            <div className="text-[13.5px] text-fog">Try a different status or payment filter.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Filter({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-semibold text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-line3 rounded-[10px] text-[13.5px] bg-white cursor-pointer outline-none focus:border-ink capitalize"
      >
        {options.map((o) => <option key={o} value={o} className="capitalize">{o}</option>)}
      </select>
    </div>
  );
}

function Th({ children, className = '' }) {
  return <th className={`text-left text-[11px] font-bold tracking-wider text-fog uppercase px-3 py-3 ${className}`}>{children}</th>;
}
