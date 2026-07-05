import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { SearchIcon, HeartIcon, BagIcon } from './Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { getCategories } from '../api/categories.js';

export default function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishCount } = useWishlist();

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');

  // Load categories once so the nav links can filter the listing by real ids.
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data.slice(0, 4)))
      .catch(() => setCategories([]));
  }, []);

  const activeCategory = searchParams.get('category');

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/products?keyword=${encodeURIComponent(search.trim())}`);
  }

  // Shared style for the top nav links.
  function linkClass(isActive) {
    return `text-sm px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
      isActive ? 'text-accent font-semibold' : 'text-[#3A3F3B] font-medium hover:text-accent'
    }`;
  }

  return (
    <header className="w-full bg-white border-b border-line">
      {/* Main nav */}
      <nav className="container-page h-[72px] flex items-center gap-6 px-8">
        <Link to="/" className="font-display font-extrabold text-[23px] tracking-tight text-ink flex-shrink-0">
          MARLOWE
        </Link>

        <div className="hidden md:flex items-center gap-1 flex-1">
          <Link to="/products?sort=-createdAt" className={linkClass(searchParams.get('sort') === '-createdAt')}>
            New
          </Link>
          {categories.map((c) => (
            <Link key={c._id} to={`/products?category=${c._id}`} className={linkClass(activeCategory === c._id)}>
              {c.name}
            </Link>
          ))}
          <Link to="/products" className="text-sm px-3 py-2 rounded-lg font-semibold text-sale hover:opacity-80">
            Sale
          </Link>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="hidden lg:flex items-center gap-2 bg-cream border border-line rounded-full px-4 py-2.5 w-[220px] text-fog"
        >
          <SearchIcon size={16} strokeWidth={2.2} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="bg-transparent text-sm outline-none w-full text-ink placeholder:text-fog"
          />
        </form>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Wishlist */}
          <IconButton to="/wishlist" label="Wishlist" badge={wishCount} icon={<HeartIcon size={21} strokeWidth={1.9} />} />
          {/* Cart */}
          <IconButton to="/cart" label="Cart" badge={cartCount} icon={<BagIcon size={21} strokeWidth={1.9} />} />

          {/* Account */}
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm font-semibold text-white bg-ink px-3 py-2 rounded-full hover:bg-accent whitespace-nowrap"
                >
                  Admin
                </Link>
              )}
              <Link to="/orders" className="text-sm font-semibold text-ink hover:text-accent whitespace-nowrap">
                Hi, {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-sm text-fog hover:text-ink"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-2 bg-ink text-white text-sm font-semibold px-4 py-2.5 rounded-full whitespace-nowrap hover:bg-accent"
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

// A round icon button (wishlist / cart) with a little count badge.
function IconButton({ to, label, badge, icon }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="relative w-10 h-10 rounded-full text-ink flex items-center justify-center hover:bg-cream"
    >
      {icon}
      {badge > 0 && (
        <span className="absolute top-0.5 right-0.5 bg-accent text-white text-[10px] font-bold min-w-[16px] h-4 px-[3px] rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  );
}
