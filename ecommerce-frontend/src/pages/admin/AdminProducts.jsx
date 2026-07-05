import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../api/products.js';
import { getCategories } from '../../api/categories.js';
import { adminDeleteProduct } from '../../api/admin.js';
import { money } from '../../lib/format.js';
import { useToast } from '../../context/ToastContext.jsx';
import ProductImage from '../../components/ProductImage.jsx';
import StarRating from '../../components/StarRating.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/Icons.jsx';

const PAGE_SIZE = 8;

export default function AdminProducts() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [result, setResult] = useState({ data: [], totalPages: 1, totalProducts: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null); // product pending delete
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  // Load products whenever the filters change. A short debounce keeps typing smooth.
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      const params = { page, limit: PAGE_SIZE };
      if (search) params.keyword = search;
      if (category) params.category = category;
      getProducts(params)
        .then(setResult)
        .catch(() => setResult({ data: [], totalPages: 1, totalProducts: 0 }))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, page]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await adminDeleteProduct(confirm._id);
      showToast(`"${confirm.name}" deleted`);
      setConfirm(null);
      // Reload the current page (step back if we just emptied it).
      setPage((p) => (result.data.length === 1 && p > 1 ? p - 1 : p));
      setResult((r) => ({ ...r, data: r.data.filter((x) => x._id !== confirm._id) }));
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <div className="relative flex-1 min-w-[190px] max-w-[320px]">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist pointer-events-none">
            <SearchIcon size={17} />
          </span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products…"
            className="w-full pl-10 pr-3 py-2.5 border border-line3 rounded-[10px] text-sm bg-white outline-none focus:border-ink"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-line3 rounded-[10px] text-sm bg-white cursor-pointer outline-none focus:border-ink"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <div className="flex-1" />
        <button onClick={() => navigate('/admin/products/new')} className="btn-primary py-2.5">
          <PlusIcon size={16} strokeWidth={2.4} /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-[#FBFAF6] border-b border-[#EEEAE2]">
                <Th className="pl-5">Product</Th>
                <Th>Category</Th>
                <Th className="text-right">Price</Th>
                <Th>Stock</Th>
                <Th>Rating</Th>
                <Th className="text-right pr-5">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-6"><Skeleton className="h-40 w-full" /></td></tr>
              ) : (
                result.data.map((p) => (
                  <tr key={p._id} className="border-t border-[#F1EEE8] hover:bg-[#FBFAF6]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-11 h-11 rounded-[10px] overflow-hidden flex-shrink-0">
                          <ProductImage product={p} glyphSize={24} />
                        </span>
                        <span className="text-sm font-semibold">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[13px] text-[#3A3F3B] bg-[#F4F2EC] px-2.5 py-1 rounded-full">{p.category?.name || '—'}</span>
                    </td>
                    <td className="px-3 py-3 text-right font-display font-bold text-sm tabular-nums">{money(p.price)}</td>
                    <td className="px-3 py-3"><StockPill stock={p.stock} /></td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <StarRating rating={p.averageRating} />
                        <span className="text-[13px] text-fog font-semibold">{Number(p.averageRating).toFixed(1)}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <IconBtn title="Edit" onClick={() => navigate(`/admin/products/${p._id}/edit`)}>
                          <EditIcon size={16} strokeWidth={1.9} />
                        </IconBtn>
                        <IconBtn title="Delete" danger onClick={() => setConfirm(p)}>
                          <TrashIcon size={16} strokeWidth={1.9} />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && result.data.length === 0 && (
          <div className="py-14 text-center">
            <div className="font-display font-bold text-base mb-1">No products found</div>
            <div className="text-[13.5px] text-fog">Try adjusting your search or category filter.</div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between gap-3 flex-wrap px-5 py-3.5 border-t border-[#F1EEE8]">
          <span className="text-[13px] text-fog">{result.totalProducts} products</span>
          <div className="flex items-center gap-1.5">
            <PageBtn disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeftIcon size={16} strokeWidth={2.2} />
            </PageBtn>
            <span className="text-sm font-semibold px-2 tabular-nums">
              {page} / {result.totalPages || 1}
            </span>
            <PageBtn disabled={page >= result.totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRightIcon size={16} strokeWidth={2.2} />
            </PageBtn>
          </div>
        </div>
      </div>

      {confirm && (
        <ConfirmDialog
          title="Delete product?"
          message={`"${confirm.name}" will be permanently removed from your catalog. This can't be undone.`}
          confirmLabel="Delete product"
          busy={deleting}
          onCancel={() => setConfirm(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function Th({ children, className = '' }) {
  return <th className={`text-left text-[11px] font-bold tracking-wider text-fog uppercase px-3 py-3 ${className}`}>{children}</th>;
}

function StockPill({ stock }) {
  let cls = 'bg-accent-tint text-accent';
  let label = `${stock} in stock`;
  if (stock === 0) { cls = 'bg-sale-bg text-sale'; label = 'Out of stock'; }
  else if (stock <= 5) { cls = 'bg-[#FBF3E2] text-[#9A6B12]'; label = `${stock} left`; }
  return <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{label}</span>;
}

function IconBtn({ children, title, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-[34px] h-[34px] rounded-[9px] border border-line bg-white flex items-center justify-center ${
        danger ? 'text-sale hover:border-sale hover:bg-sale-bg' : 'text-[#3A3F3B] hover:border-ink hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

function PageBtn({ children, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="min-w-[34px] h-[34px] rounded-lg border border-line bg-white flex items-center justify-center text-[#3A3F3B] disabled:opacity-40 hover:border-ink"
    >
      {children}
    </button>
  );
}
