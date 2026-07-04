import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/products.js';
import { getCategories } from '../api/categories.js';
import ProductCard from '../components/ProductCard.jsx';
import { ProductGridSkeleton } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from '../components/Icons.jsx';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'price', label: 'Price: low to high' },
  { value: '-price', label: 'Price: high to low' },
];

export default function Products() {
  // The URL is the single source of truth for filters, so links & refreshes work.
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState({ data: [], totalPages: 1, totalProducts: 0, page: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read the current filters from the URL.
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Number(searchParams.get('page')) || 1;

  // Local input state (so typing doesn't hit the API on every keystroke).
  const [searchInput, setSearchInput] = useState(keyword);
  const [priceInputs, setPriceInputs] = useState({ min: minPrice, max: maxPrice });

  useEffect(() => setSearchInput(keyword), [keyword]);
  useEffect(() => setPriceInputs({ min: minPrice, max: maxPrice }), [minPrice, maxPrice]);

  // Load categories once for the sidebar.
  useEffect(() => {
    getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  // Re-fetch products whenever any filter in the URL changes.
  useEffect(() => {
    setLoading(true);
    const params = { sort, page, limit: 9 };
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    getProducts(params)
      .then(setResult)
      .catch(() => setResult({ data: [], totalPages: 1, totalProducts: 0, page: 1 }))
      .finally(() => setLoading(false));
  }, [keyword, category, sort, minPrice, maxPrice, page]);

  // Update one filter in the URL. Changing a filter resets back to page 1.
  function setParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  }

  function clearAll() {
    setSearchParams(new URLSearchParams());
  }

  const activeCategory = categories.find((c) => c._id === category);

  return (
    <div className="container-page py-8">
      <div className="card shadow-card overflow-hidden">
        {/* Header */}
        <div className="px-10 pt-8 pb-2">
          <div className="text-[13px] text-fog mb-3.5">
            <Link to="/" className="hover:text-ink">Home</Link> / <span className="text-ink">All products</span>
          </div>
          <div className="flex items-end justify-between gap-5 flex-wrap">
            <div>
              <h1 className="font-display font-bold text-[32px] tracking-tight">
                {activeCategory ? activeCategory.name : 'All products'}
              </h1>
              <p className="text-fog text-sm mt-1.5">
                Showing {result.data.length} of {result.totalProducts} items
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {/* Search */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setParam('keyword', searchInput.trim());
                }}
                className="flex items-center gap-2 bg-cream border border-line rounded-full px-4 py-2.5 w-[240px] text-fog"
              >
                <SearchIcon size={16} strokeWidth={2.2} />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products…"
                  className="bg-transparent text-sm outline-none w-full text-ink placeholder:text-fog"
                />
              </form>
              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setParam('sort', e.target.value)}
                className="border border-line3 rounded-full px-4 py-2.5 text-sm font-semibold bg-white cursor-pointer hover:border-ink outline-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Body: sidebar + grid */}
        <div className="grid md:grid-cols-[248px_1fr] gap-8 px-10 pt-6 pb-14 items-start">
          {/* Filters sidebar */}
          <aside className="border border-line2 rounded-2xl p-5 md:sticky md:top-5">
            <div className="flex items-center justify-between mb-5">
              <span className="font-display font-bold text-base">Filters</span>
              <button onClick={clearAll} className="text-[13px] text-accent font-semibold">
                Clear all
              </button>
            </div>

            {/* Category */}
            <div className="border-t border-[#F1EEE8] pt-4">
              <div className="text-[13px] font-bold mb-3">Category</div>
              {categories.map((c) => {
                const on = c._id === category;
                return (
                  <label
                    key={c._id}
                    className="flex items-center gap-2.5 text-sm text-[#3A3F3B] mb-3 cursor-pointer"
                    onClick={() => setParam('category', on ? '' : c._id)}
                  >
                    <span
                      className={`w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center flex-shrink-0 ${
                        on ? 'bg-accent border-accent' : 'border-[#C7C3B8] bg-white'
                      }`}
                    >
                      {on && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </span>
                    <span className="flex-1">{c.name}</span>
                  </label>
                );
              })}
            </div>

            {/* Price range */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setParam('minPrice', priceInputs.min);
                setParam('maxPrice', priceInputs.max);
              }}
              className="border-t border-[#F1EEE8] pt-4 mt-3.5"
            >
              <div className="text-[13px] font-bold mb-3.5">Price range</div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={priceInputs.min}
                  onChange={(e) => setPriceInputs((p) => ({ ...p, min: e.target.value }))}
                  className="w-full border border-line3 rounded-lg px-2.5 py-2 text-[13px] outline-none focus:border-accent"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={priceInputs.max}
                  onChange={(e) => setPriceInputs((p) => ({ ...p, max: e.target.value }))}
                  className="w-full border border-line3 rounded-lg px-2.5 py-2 text-[13px] outline-none focus:border-accent"
                />
              </div>
              <button type="submit" className="btn-secondary w-full mt-3 py-2 text-[13px]">
                Apply price
              </button>
            </form>
          </aside>

          {/* Grid */}
          <div>
            {/* Active filter chips */}
            {(activeCategory || minPrice || maxPrice || keyword) && (
              <div className="flex flex-wrap gap-2 mb-5">
                {keyword && <FilterChip label={`“${keyword}”`} onRemove={() => setParam('keyword', '')} />}
                {activeCategory && <FilterChip label={activeCategory.name} onRemove={() => setParam('category', '')} />}
                {(minPrice || maxPrice) && (
                  <FilterChip
                    label={`$${minPrice || 0}–$${maxPrice || '∞'}`}
                    onRemove={() => {
                      setParam('minPrice', '');
                      setParam('maxPrice', '');
                    }}
                  />
                )}
              </div>
            )}

            {loading ? (
              <ProductGridSkeleton count={9} columns={3} />
            ) : result.data.length === 0 ? (
              <EmptyState
                title="No products found"
                subtitle="Try removing a filter or searching for something else."
                actionLabel="Clear filters"
                actionTo="/products"
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {result.data.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {result.totalPages > 1 && (
              <Pagination page={page} totalPages={result.totalPages} onChange={(p) => setParam('page', String(p))} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-accent-tint text-accent text-[13px] font-semibold px-3 py-1.5 rounded-full">
      {label}
      <button onClick={onRemove} aria-label="Remove filter">
        <XIcon size={12} strokeWidth={2.4} />
      </button>
    </span>
  );
}

function Pagination({ page, totalPages, onChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-2 mt-9">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="w-10 h-10 rounded-[10px] border border-line bg-white text-fog flex items-center justify-center disabled:opacity-40 hover:border-ink"
      >
        <ChevronLeftIcon size={16} strokeWidth={2.2} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-10 h-10 rounded-[10px] text-sm font-semibold ${
            p === page ? 'bg-accent text-white' : 'border border-line bg-white hover:border-ink'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="w-10 h-10 rounded-[10px] border border-line bg-white text-ink flex items-center justify-center disabled:opacity-40 hover:border-ink"
      >
        <ChevronRightIcon size={16} strokeWidth={2.2} />
      </button>
    </div>
  );
}
