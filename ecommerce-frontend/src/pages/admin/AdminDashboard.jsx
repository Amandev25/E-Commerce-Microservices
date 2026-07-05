import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../api/products.js';
import { adminGetOrders } from '../../api/admin.js';
import { money } from '../../lib/format.js';
import { StatusBadge, PaymentBadge } from '../../components/admin/StatusBadge.jsx';
import ProductImage from '../../components/ProductImage.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { PackageIcon, BagIcon, ClockIcon, DollarIcon, ArrowRightIcon, AlertTriangleIcon } from '../../components/Icons.jsx';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStock, setLowStock] = useState([]);

  function load() {
    setLoading(true);
    // Compose the dashboard from existing endpoints:
    //  - all orders (for counts + revenue)
    //  - product count (totalProducts from a 1-item query)
    //  - the 5 lowest-stock products
    Promise.all([
      adminGetOrders(),
      getProducts({ limit: 1 }),
      getProducts({ sort: 'stock', limit: 5 }),
    ])
      .then(([ordersRes, countRes, lowRes]) => {
        setOrders(ordersRes.data);
        setTotalProducts(countRes.totalProducts);
        setLowStock(lowRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  // Derive the stat numbers from the orders list.
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const revenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.finalTotal, 0);

  const stats = [
    { label: 'Total products', value: totalProducts, icon: PackageIcon, tint: 'bg-accent-tint', color: 'text-accent' },
    { label: 'Total orders', value: orders.length, icon: BagIcon, tint: 'bg-[#EAF0FB]', color: 'text-[#2E5AAC]' },
    { label: 'Pending orders', value: pendingCount, icon: ClockIcon, tint: 'bg-[#FBF3E2]', color: 'text-[#9A6B12]' },
    { label: 'Total revenue', value: money(revenue), icon: DollarIcon, tint: 'bg-accent-tint', color: 'text-accent' },
  ];

  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight mb-1">Store overview</h2>
          <p className="text-[14.5px] text-muted">Here's what's happening in your store.</p>
        </div>
        <button onClick={load} className="btn-secondary">Refresh</button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-line rounded-2xl p-5">
            <span className={`w-[42px] h-[42px] rounded-[11px] ${s.tint} ${s.color} flex items-center justify-center mb-4`}>
              <s.icon size={21} strokeWidth={1.9} />
            </span>
            <div className="font-display font-extrabold text-2xl md:text-3xl tracking-tight tabular-nums">
              {loading ? '—' : s.value}
            </div>
            <div className="text-[13.5px] text-fog mt-1.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        {/* Recent orders */}
        <section className="bg-white border border-line rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#F1EEE8]">
            <div>
              <h3 className="font-display font-bold text-base">Recent orders</h3>
              <p className="text-[12.5px] text-fog mt-0.5">Latest transactions across the store</p>
            </div>
            <button onClick={() => navigate('/admin/orders')} className="text-[13px] text-accent font-semibold inline-flex items-center gap-1.5 hover:opacity-70">
              View all <ArrowRightIcon size={14} strokeWidth={2.2} />
            </button>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-5 flex flex-col gap-3">
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center text-fog text-sm">No orders yet.</div>
            ) : (
              <table className="w-full border-collapse min-w-[520px]">
                <thead>
                  <tr className="bg-[#FBFAF6]">
                    <Th className="pl-5">Order</Th>
                    <Th>Customer</Th>
                    <Th className="text-right">Total</Th>
                    <Th>Payment</Th>
                    <Th className="pr-5">Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 6).map((o) => (
                    <tr
                      key={o._id}
                      onClick={() => navigate(`/admin/orders/${o._id}`)}
                      className="border-t border-[#F1EEE8] cursor-pointer hover:bg-[#FBFAF6]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-display font-bold text-[13.5px]">#{o._id.slice(-6).toUpperCase()}</div>
                        <div className="text-xs text-mist mt-0.5">
                          {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item{o.items.length !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-sm text-[#3A3F3B] whitespace-nowrap">{o.user?.name || '—'}</td>
                      <td className="px-3 py-3.5 text-right font-display font-bold text-sm tabular-nums whitespace-nowrap">{money(o.finalTotal)}</td>
                      <td className="px-3 py-3.5"><PaymentBadge status={o.paymentStatus} /></td>
                      <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Low stock */}
        <section className="bg-white border border-line rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F1EEE8]">
            <div className="flex items-center gap-2">
              <span className="text-sale flex"><AlertTriangleIcon size={17} strokeWidth={2} /></span>
              <h3 className="font-display font-bold text-base">Low stock</h3>
            </div>
            <p className="text-[12.5px] text-fog mt-1">Products running low — restock soon</p>
          </div>
          {loading ? (
            <div className="p-5 flex flex-col gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            lowStock.map((p) => {
              const critical = p.stock <= 3;
              return (
                <div key={p._id} className="flex items-center gap-3 px-5 py-3.5 border-t border-[#F1EEE8]">
                  <span className="w-[42px] h-[42px] rounded-[10px] overflow-hidden flex-shrink-0">
                    <ProductImage product={p} glyphSize={22} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-fog mt-0.5">{p.category?.name}</div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${critical ? 'bg-sale-bg text-sale' : 'bg-[#FBF3E2] text-[#9A6B12]'}`}>
                    {p.stock} left
                  </span>
                </div>
              );
            })
          )}
          <button onClick={() => navigate('/admin/products')} className="w-full py-3.5 border-t border-[#F1EEE8] text-[13.5px] font-semibold text-accent hover:bg-[#FBFAF6]">
            Manage inventory
          </button>
        </section>
      </div>
    </div>
  );
}

function Th({ children, className = '' }) {
  return (
    <th className={`text-left text-[11px] font-bold tracking-wider text-fog uppercase px-3 py-3 ${className}`}>
      {children}
    </th>
  );
}
