import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { initials } from '../../lib/format.js';
import {
  GridIcon, PackageIcon, TagIcon, ReceiptIcon, TicketIcon,
  LogoutIcon, MenuIcon, BellIcon,
} from '../Icons.jsx';

// The links in the sidebar. `end` makes the Dashboard link only active on the exact path.
const NAV = [
  { to: '/admin', label: 'Dashboard', Icon: GridIcon, end: true },
  { to: '/admin/products', label: 'Products', Icon: PackageIcon },
  { to: '/admin/categories', label: 'Categories', Icon: TagIcon },
  { to: '/admin/orders', label: 'Orders', Icon: ReceiptIcon },
  { to: '/admin/coupons', label: 'Coupons', Icon: TicketIcon },
];

// A readable title for the top bar, based on the current URL.
function titleForPath(pathname) {
  if (pathname === '/admin') return 'Dashboard';
  if (pathname.startsWith('/admin/products')) return 'Products';
  if (pathname.startsWith('/admin/categories')) return 'Categories';
  if (pathname.startsWith('/admin/orders')) return 'Orders';
  if (pathname.startsWith('/admin/coupons')) return 'Coupons';
  return 'Admin';
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile sidebar

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[#F4F2EC] text-ink">
      {/* Dark overlay behind the drawer on mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-30 bg-black/45 md:hidden" onClick={() => setDrawerOpen(false)} />
      )}

      {/* ---------- Sidebar ---------- */}
      <aside
        className={`fixed md:static z-40 top-0 bottom-0 left-0 w-[250px] flex-shrink-0 bg-ink text-[#B7BBB5] flex flex-col transition-transform md:translate-x-0 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-5 flex items-center gap-3 border-b border-[#262A27]">
          <span className="w-[34px] h-[34px] rounded-[9px] bg-accent flex items-center justify-center font-display font-extrabold text-[17px] text-white">M</span>
          <div>
            <div className="font-display font-extrabold text-[17px] tracking-tight text-white leading-none">MARLOWE</div>
            <div className="text-[11px] text-[#7E837D] tracking-wider mt-0.5">ADMIN CONSOLE</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <div className="text-[11px] font-bold tracking-widest text-[#5F645E] px-3 pt-1.5 pb-2.5">MANAGE</div>
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-semibold mb-0.5 transition-colors ${
                  isActive ? 'bg-accent text-white' : 'text-[#B7BBB5] hover:bg-[#262A27] hover:text-white'
                }`
              }
            >
              <Icon size={20} strokeWidth={1.9} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-[#262A27]">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-semibold text-[#B7BBB5] hover:bg-[#262A27] hover:text-white mb-1"
          >
            <PackageIcon size={20} strokeWidth={1.9} />
            View storefront
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-semibold text-[#B7BBB5] hover:bg-[#262A27] hover:text-white"
          >
            <LogoutIcon size={20} strokeWidth={1.9} />
            Log out
          </button>
        </div>
      </aside>

      {/* ---------- Main ---------- */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 bg-white border-b border-line px-4 md:px-8 h-[68px] flex items-center gap-4">
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden w-10 h-10 rounded-[10px] border border-line bg-white flex items-center justify-center"
            aria-label="Open menu"
          >
            <MenuIcon size={20} />
          </button>
          <h1 className="font-display font-bold text-xl tracking-tight">{titleForPath(location.pathname)}</h1>
          <div className="flex-1" />
          <button className="w-10 h-10 rounded-[10px] border border-line bg-white relative flex items-center justify-center hover:border-ink" aria-label="Notifications">
            <BellIcon size={18} strokeWidth={1.8} />
            <span className="absolute top-2 right-2.5 w-[7px] h-[7px] rounded-full bg-accent border-2 border-white" />
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-line">
            <span className="w-[38px] h-[38px] rounded-full bg-accent text-white flex items-center justify-center font-bold text-[15px]">
              {initials(user?.name || 'A')}
            </span>
            <div className="hidden sm:block">
              <div className="text-[13.5px] font-semibold leading-tight">{user?.name}</div>
              <div className="text-xs text-fog leading-tight">Store administrator</div>
            </div>
          </div>
        </header>

        {/* Routed content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
