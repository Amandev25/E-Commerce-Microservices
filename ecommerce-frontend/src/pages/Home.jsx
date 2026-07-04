import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/products.js';
import { getCategories } from '../api/categories.js';
import ProductCard from '../components/ProductCard.jsx';
import { ProductGridSkeleton } from '../components/Skeleton.jsx';
import { ProductGlyph } from '../components/Icons.jsx';
import { ArrowRightIcon, TruckIcon } from '../components/Icons.jsx';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load the featured products and category shortcuts when the page opens.
  useEffect(() => {
    Promise.all([getProducts({ limit: 8, sort: '-createdAt' }), getCategories()])
      .then(([productsRes, catsRes]) => {
        setFeatured(productsRes.data);
        setCategories(catsRes.data.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page py-8">
      <div className="card shadow-card overflow-hidden">
        {/* ---------- Hero ---------- */}
        <div className="grid md:grid-cols-2 bg-cream">
          <div className="px-8 md:px-14 py-14 md:py-[72px] flex flex-col justify-center">
            <span className="text-[13px] font-semibold tracking-wide uppercase text-accent mb-4">
              New season · 2026
            </span>
            <h1 className="font-display font-extrabold text-4xl md:text-[56px] leading-[1.02] tracking-tight mb-5">
              Everyday things, thoughtfully&nbsp;made.
            </h1>
            <p className="text-[17px] leading-relaxed text-muted mb-8 max-w-[440px]">
              Home, tech, apparel and beauty — a tightly edited collection of pieces built to last. Free shipping over $75.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/products" className="bg-accent text-white text-[15px] font-semibold px-6 py-3.5 rounded-full hover:bg-accent-dark">
                Shop new arrivals
              </Link>
              <Link to="/products" className="bg-white text-ink text-[15px] font-semibold px-6 py-3.5 rounded-full border border-line3 hover:border-ink">
                Browse categories
              </Link>
            </div>
            <div className="flex gap-6 mt-10">
              <Stat value="4.8★" label="12k+ reviews" />
              <Divider />
              <Stat value="30-day" label="easy returns" />
              <Divider />
              <Stat value="Secure" label="Razorpay checkout" />
            </div>
          </div>

          {/* Decorative product tile */}
          <div className="relative bg-accent-tint flex items-center justify-center min-h-[440px] overflow-hidden">
            <div className="w-[230px] h-[230px] rounded-full bg-[#DCEBE1] absolute" />
            <div className="relative z-10">
              <ProductGlyph category="Home & Living" size={170} color="#7FA98F" />
            </div>
            <div className="absolute bottom-7 left-7 bg-white rounded-xl px-4 py-3 shadow-float flex items-center gap-3">
              <span className="w-[34px] h-[34px] rounded-[9px] bg-accent-tint flex items-center justify-center text-accent">
                <ArrowRightIcon size={18} />
              </span>
              <div>
                <div className="text-[13px] font-semibold">Free shipping</div>
                <div className="text-xs text-fog">on orders over $75</div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Category shortcuts ---------- */}
        <div className="px-10 pt-11 pb-2">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((c) => (
              <Link
                key={c._id}
                to={`/products?category=${c._id}`}
                className="border border-line2 rounded-2xl px-3.5 py-5 flex flex-col items-center gap-2.5 bg-white hover:border-accent hover:bg-[#F7FBF8]"
              >
                <span className="w-12 h-12 rounded-xl bg-[#EEEDE8] flex items-center justify-center">
                  <ProductGlyph category={c.name} size={26} color="#5B615C" />
                </span>
                <span className="text-[13.5px] font-semibold text-center">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ---------- Promo / coupon banner ---------- */}
        <div className="px-10 py-7">
          <div className="bg-accent rounded-2xl px-9 py-8 flex items-center justify-between gap-6 flex-wrap text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-[200px] h-[200px] rounded-full bg-white/[.06]" />
            <div className="relative">
              <div className="text-[13px] font-semibold tracking-wide uppercase text-[#9FE3BC] mb-2">
                Limited-time offer
              </div>
              <div className="font-display font-extrabold text-3xl tracking-tight">15% off your first order</div>
              <div className="text-[15px] text-[#CDE9D8] mt-1.5">Use the code below at checkout.</div>
            </div>
            <div className="relative flex items-center gap-3.5 flex-wrap">
              <div className="border-2 border-dashed border-white/45 rounded-xl px-5 py-3 font-display font-bold text-xl tracking-widest">
                WELCOME15
              </div>
              <Link to="/products" className="bg-white text-accent text-[15px] font-bold px-6 py-3.5 rounded-full">
                Shop now
              </Link>
            </div>
          </div>
        </div>

        {/* ---------- Featured grid ---------- */}
        <div className="px-10 pb-14 pt-5">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-[26px] tracking-tight">Featured this week</h3>
              <p className="text-fog text-sm mt-1.5">Hand-picked by our team</p>
            </div>
            <Link to="/products" className="text-accent text-sm font-semibold inline-flex items-center gap-1.5">
              View all
              <ArrowRightIcon size={14} strokeWidth={2.2} />
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} columns={4} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="font-display font-bold text-[22px]">{value}</div>
      <div className="text-[13px] text-fog">{label}</div>
    </div>
  );
}

function Divider() {
  return <div className="w-px bg-[#E2DED5]" />;
}
