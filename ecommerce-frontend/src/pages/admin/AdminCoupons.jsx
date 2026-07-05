import { useState, useEffect } from 'react';
import { adminGetCoupons, adminCreateCoupon, adminUpdateCoupon, adminDeleteCoupon } from '../../api/admin.js';
import { money } from '../../lib/format.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PlusIcon, TrashIcon, PercentIcon, DollarIcon } from '../../components/Icons.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import { ModalShell } from './AdminCategories.jsx';
import Skeleton from '../../components/Skeleton.jsx';

const EMPTY = { code: '', type: 'percent', value: '', min: '', expiry: '', limit: '', active: true };

export default function AdminCoupons() {
  const showToast = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  function load() {
    setLoading(true);
    adminGetCoupons()
      .then((res) => setCoupons(res.data))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  // Optimistically flip the active switch, then persist.
  async function toggleActive(coupon) {
    setCoupons((cs) => cs.map((c) => (c._id === coupon._id ? { ...c, isActive: !c.isActive } : c)));
    try {
      await adminUpdateCoupon(coupon._id, { isActive: !coupon.isActive });
      showToast(`${coupon.code} ${coupon.isActive ? 'disabled' : 'enabled'}`);
    } catch {
      load(); // revert by reloading the truth
      showToast('Could not update coupon', 'error');
    }
  }

  async function saveCoupon() {
    if (!modal.code.trim() || modal.value === '') return setModal((m) => ({ ...m, err: true }));
    setBusy(true);
    try {
      await adminCreateCoupon({
        code: modal.code.trim().toUpperCase(),
        type: modal.type,
        value: Number(modal.value),
        minCartValue: Number(modal.min || 0),
        expiresAt: modal.expiry || '2030-12-31',
        usageLimit: modal.limit ? Number(modal.limit) : null,
        isActive: modal.active,
      });
      showToast('Coupon created');
      setModal(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not create coupon', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function deleteCoupon() {
    setBusy(true);
    try {
      await adminDeleteCoupon(confirm._id);
      showToast(`"${confirm.code}" deleted`);
      setConfirm(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <p className="text-sm text-muted">Manage promotional codes. Expired coupons are dimmed.</p>
        <button onClick={() => setModal({ ...EMPTY })} className="btn-primary py-2.5">
          <PlusIcon size={16} strokeWidth={2.4} /> Create Coupon
        </button>
      </div>

      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[860px]">
            <thead>
              <tr className="bg-[#FBFAF6] border-b border-[#EEEAE2]">
                <Th className="pl-5">Code</Th>
                <Th>Type</Th>
                <Th className="text-right">Value</Th>
                <Th className="text-right">Min cart</Th>
                <Th>Expiry</Th>
                <Th>Usage</Th>
                <Th>Active</Th>
                <th className="w-14" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-6"><Skeleton className="h-40 w-full" /></td></tr>
              ) : (
                coupons.map((c) => {
                  const expired = new Date(c.expiresAt) < new Date();
                  const pct = c.usageLimit ? Math.min(100, (c.usedCount / c.usageLimit) * 100) : 0;
                  return (
                    <tr key={c._id} className={`border-t border-[#F1EEE8] ${expired ? 'opacity-55' : 'hover:bg-[#FBFAF6]'}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <code className="font-mono text-[13.5px] font-bold tracking-wide">{c.code}</code>
                          {expired && <span className="text-[11px] font-bold text-sale bg-sale-bg px-2 py-0.5 rounded-full">Expired</span>}
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-[13.5px] text-[#3A3F3B]">
                          {c.type === 'percent' ? <PercentIcon size={15} strokeWidth={2} /> : <DollarIcon size={15} strokeWidth={2} />}
                          {c.type === 'percent' ? 'Percent' : 'Flat'}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-right font-display font-bold text-sm tabular-nums">
                        {c.type === 'percent' ? `${c.value}%` : money(c.value)}
                      </td>
                      <td className="px-3 py-3.5 text-right text-[13.5px] text-muted tabular-nums">{money(c.minCartValue)}</td>
                      <td className="px-3 py-3.5 text-[13.5px] text-muted whitespace-nowrap">{new Date(c.expiresAt).toLocaleDateString()}</td>
                      <td className="px-3 py-3.5 min-w-[120px]">
                        <div className="text-[12.5px] text-muted mb-1.5 tabular-nums">
                          {c.usedCount} / {c.usageLimit ?? '∞'}
                        </div>
                        <div className="h-[5px] rounded-full bg-[#EEEAE2] overflow-hidden">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <Toggle on={c.isActive} disabled={expired} onClick={() => !expired && toggleActive(c)} />
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => setConfirm(c)} title="Delete" className="w-[34px] h-[34px] rounded-[9px] border border-line bg-white flex items-center justify-center text-sale hover:border-sale hover:bg-sale-bg">
                          <TrashIcon size={16} strokeWidth={1.9} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {modal && (
        <ModalShell title="Create coupon" onCancel={() => setModal(null)} onSave={saveCoupon} saveLabel="Create coupon" busy={busy}>
          <Field label="Coupon code" error={modal.err && !modal.code.trim() && 'Code is required'}>
            <input
              value={modal.code}
              onChange={(e) => setModal((m) => ({ ...m, code: e.target.value, err: false }))}
              placeholder="SUMMER25"
              className="input font-mono font-bold tracking-wide uppercase"
            />
          </Field>
          <Field label="Discount type">
            <div className="flex gap-2.5">
              <TypeBtn active={modal.type === 'percent'} onClick={() => setModal((m) => ({ ...m, type: 'percent' }))}>Percentage</TypeBtn>
              <TypeBtn active={modal.type === 'flat'} onClick={() => setModal((m) => ({ ...m, type: 'flat' }))}>Flat amount</TypeBtn>
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={`Value (${modal.type === 'percent' ? '%' : '$'})`} error={modal.err && modal.value === '' && 'Required'}>
              <input value={modal.value} onChange={(e) => setModal((m) => ({ ...m, value: e.target.value, err: false }))} inputMode="decimal" placeholder="10" className="input" />
            </Field>
            <Field label="Min cart ($)">
              <input value={modal.min} onChange={(e) => setModal((m) => ({ ...m, min: e.target.value }))} inputMode="decimal" placeholder="0" className="input" />
            </Field>
            <Field label="Expiry date">
              <input value={modal.expiry} onChange={(e) => setModal((m) => ({ ...m, expiry: e.target.value }))} type="date" className="input" />
            </Field>
            <Field label="Usage limit">
              <input value={modal.limit} onChange={(e) => setModal((m) => ({ ...m, limit: e.target.value }))} inputMode="numeric" placeholder="Unlimited" className="input" />
            </Field>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border border-line2 rounded-xl bg-[#FBFAF6]">
            <div>
              <div className="text-sm font-semibold">Active</div>
              <div className="text-[12.5px] text-fog">Coupon can be redeemed immediately</div>
            </div>
            <Toggle on={modal.active} onClick={() => setModal((m) => ({ ...m, active: !m.active }))} />
          </div>
        </ModalShell>
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete coupon?"
          message={`Coupon "${confirm.code}" will be removed and can no longer be redeemed.`}
          confirmLabel="Delete coupon"
          busy={busy}
          onCancel={() => setConfirm(null)}
          onConfirm={deleteCoupon}
        />
      )}
    </div>
  );
}

function Th({ children, className = '' }) {
  return <th className={`text-left text-[11px] font-bold tracking-wider text-fog uppercase px-3 py-3 ${className}`}>{children}</th>;
}

function Toggle({ on, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${on ? 'bg-accent' : 'bg-[#D9D5CB]'} ${disabled ? 'opacity-50' : ''}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

function TypeBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-[10px] text-sm font-semibold border transition-colors ${
        active ? 'border-accent bg-accent-tint text-accent' : 'border-line3 bg-white text-muted hover:border-ink'
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-[#3A3F3B] mb-1.5">{label}</label>
      {children}
      {error && <div className="text-[12.5px] text-sale mt-1.5">{error}</div>}
    </div>
  );
}
