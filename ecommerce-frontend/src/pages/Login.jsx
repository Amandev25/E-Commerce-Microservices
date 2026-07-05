import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AuthBrandPanel from '../components/AuthBrandPanel.jsx';
import { MailIcon, LockIcon, EyeIcon, UserIcon, ShieldIcon, BoltIcon, ArrowLeftIcon, CheckIcon } from '../components/Icons.jsx';

// Demo accounts created by the backend seed script (see ecommerce-backend/src/seed.js).
const DEMO_CUSTOMER = { email: 'priya@marlowe.test', password: 'password123' };
const DEMO_ADMIN = { email: 'admin@marlowe.test', password: 'password123' };

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const showToast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function doLogin(creds) {
    setLoading(true);
    try {
      const user = await login(creds.email, creds.password);
      showToast('Welcome back!');
      // If a protected page sent us here, go back to it. Otherwise send admins
      // straight to the console and regular users to the storefront.
      const destination = location.state?.from || (user.role === 'admin' ? '/admin' : '/');
      navigate(destination, { replace: true });
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-[1100px] card shadow-card overflow-hidden grid md:grid-cols-2">
        <AuthBrandPanel
          heading="Welcome back."
          text="Sign in to track orders, save your wishlist, and check out faster. New here? Creating an account takes seconds."
        />

        {/* Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display font-bold text-[28px] tracking-tight">Sign in</h1>
            <Link to="/" className="text-[13px] text-fog hover:text-ink inline-flex items-center gap-1.5">
              <ArrowLeftIcon size={14} strokeWidth={2.2} />
              Back to store
            </Link>
          </div>

          {/* Demo quick access */}
          <div className="border border-[#CFE6D9] bg-[#F3FAF5] rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BoltIcon size={16} stroke="#0F6B3F" />
              <span className="text-sm font-bold text-accent">Explore instantly — no signup</span>
            </div>
            <p className="text-[13px] text-muted mb-3.5 leading-relaxed">
              Recruiters &amp; reviewers: jump straight in with pre-filled demo credentials.
            </p>
            <div className="flex gap-2.5">
              <button onClick={() => doLogin(DEMO_CUSTOMER)} disabled={loading} className="btn-primary flex-1 py-3">
                <UserIcon size={16} />
                Try as customer
              </button>
              <button onClick={() => doLogin(DEMO_ADMIN)} disabled={loading} className="btn-dark flex-1 py-3">
                <ShieldIcon size={16} />
                Try as admin
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3.5 mb-6">
            <div className="flex-1 h-px bg-line2" />
            <span className="text-xs text-mist">or sign in with email</span>
            <div className="flex-1 h-px bg-line2" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              doLogin({ email, password });
            }}
          >
            <label className="text-[13px] font-semibold mb-1.5 block">Email address</label>
            <div className="flex items-center gap-2.5 input mb-4 focus-within:border-accent">
              <MailIcon size={17} strokeWidth={1.8} stroke="#8A8F89" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 outline-none bg-transparent"
                required
              />
            </div>

            <label className="text-[13px] font-semibold mb-1.5 block">Password</label>
            <div className="flex items-center gap-2.5 input mb-4 focus-within:border-accent">
              <LockIcon size={17} strokeWidth={1.8} stroke="#8A8F89" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 outline-none bg-transparent"
                required
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-fog hover:text-ink" aria-label="Toggle password">
                <EyeIcon size={18} strokeWidth={1.8} />
              </button>
            </div>

            <label className="flex items-center gap-2.5 text-[13.5px] text-[#3A3F3B] mb-5 cursor-pointer">
              <span className="w-[18px] h-[18px] rounded-[5px] bg-accent flex items-center justify-center flex-shrink-0">
                <CheckIcon size={12} strokeWidth={3.2} stroke="#fff" />
              </span>
              Keep me signed in
            </label>

            <button type="submit" disabled={loading} className="btn-dark w-full py-4">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="text-center text-sm text-muted mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent font-semibold">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
