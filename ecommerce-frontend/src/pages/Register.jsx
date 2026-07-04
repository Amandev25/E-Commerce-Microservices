import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { ArrowLeftIcon, BagIcon, HeartIcon, TruckIcon } from '../components/Icons.jsx';

const BENEFITS = [
  { icon: BagIcon, title: 'Faster checkout', text: 'Saved addresses & one-tap Razorpay payments.' },
  { icon: HeartIcon, title: 'Save your wishlist', text: 'Keep favorites in sync across devices.' },
  { icon: TruckIcon, title: 'Track every order', text: 'Live status from processing to delivered.' },
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const showToast = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // Simple front-end checks before calling the API.
    if (form.password.length < 8) return showToast('Password must be at least 8 characters', 'error');
    if (form.password !== form.confirm) return showToast('Passwords do not match', 'error');
    if (!agree) return showToast('Please accept the terms to continue', 'error');

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      showToast('Account created — welcome!');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not create account', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-[1100px] card shadow-card overflow-hidden grid md:grid-cols-2">
        {/* Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-display font-bold text-[28px] tracking-tight">Create account</h1>
            <Link to="/" className="text-[13px] text-fog hover:text-ink inline-flex items-center gap-1.5">
              <ArrowLeftIcon size={14} strokeWidth={2.2} />
              Back to store
            </Link>
          </div>
          <p className="text-sm text-fog mb-6">Join Marlowe — save favorites and check out faster.</p>

          <form onSubmit={handleSubmit}>
            <label className="text-[13px] font-semibold mb-1.5 block">Full name</label>
            <input value={form.name} onChange={(e) => setField('name', e.target.value)} className="input mb-4" placeholder="Priya Sharma" required />

            <label className="text-[13px] font-semibold mb-1.5 block">Email address</label>
            <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} className="input mb-4" placeholder="you@example.com" required />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[13px] font-semibold mb-1.5 block">Password</label>
                <input type="password" value={form.password} onChange={(e) => setField('password', e.target.value)} className="input" placeholder="••••••••" required />
              </div>
              <div>
                <label className="text-[13px] font-semibold mb-1.5 block">Confirm</label>
                <input type="password" value={form.confirm} onChange={(e) => setField('confirm', e.target.value)} className="input" placeholder="••••••••" required />
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-[13px] text-muted mb-5 cursor-pointer leading-relaxed">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 w-[18px] h-[18px] accent-accent flex-shrink-0" />
              <span>
                I agree to the <a href="#" className="text-accent font-semibold">Terms</a> and{' '}
                <a href="#" className="text-accent font-semibold">Privacy Policy</a>
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="text-center text-sm text-muted mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-semibold">
              Sign in
            </Link>
          </div>
        </div>

        {/* Benefits panel */}
        <div className="bg-cream p-10 md:p-12 flex flex-col justify-center border-l border-line2">
          <div className="text-[13px] font-semibold tracking-wide uppercase text-accent mb-5">Why create an account</div>
          <div className="flex flex-col gap-5">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex gap-3.5">
                <span className="w-10 h-10 rounded-[11px] bg-accent-tint flex items-center justify-center flex-shrink-0 text-accent">
                  <b.icon size={20} strokeWidth={1.9} />
                </span>
                <div>
                  <div className="text-[15px] font-semibold">{b.title}</div>
                  <div className="text-[13.5px] text-fog leading-relaxed">{b.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 border border-dashed border-[#C7C3B8] rounded-xl px-4 py-3.5 text-[13px] text-muted leading-relaxed">
            Just browsing? You can shop as a <strong className="text-ink">guest</strong> — login is only needed to check out.
          </div>
        </div>
      </div>
    </div>
  );
}
