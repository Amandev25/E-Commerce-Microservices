import { useState, useEffect } from 'react';
import { getCategories } from '../../api/categories.js';
import { getProducts } from '../../api/products.js';
import { adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../api/admin.js';
import { useToast } from '../../context/ToastContext.jsx';
import { ProductGlyph, PlusIcon, EditIcon, TrashIcon } from '../../components/Icons.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import Skeleton from '../../components/Skeleton.jsx';

// Turn a name into a slug for the live preview (the backend generates the real one).
function slugify(name) {
  return name.toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminCategories() {
  const showToast = useToast();
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({}); // categoryId -> product count
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { id, name, description } or null
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  function load() {
    setLoading(true);
    getCategories()
      .then(async (res) => {
        setCategories(res.data);
        // Product count per category = totalProducts of a 1-item filtered query.
        const entries = await Promise.all(
          res.data.map((c) =>
            getProducts({ category: c._id, limit: 1 }).then((r) => [c._id, r.totalProducts]).catch(() => [c._id, 0])
          )
        );
        setCounts(Object.fromEntries(entries));
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function saveCategory() {
    if (!modal.name.trim()) return setModal((m) => ({ ...m, err: true }));
    setBusy(true);
    try {
      const payload = { name: modal.name.trim(), description: modal.description };
      if (modal.id) await adminUpdateCategory(modal.id, payload);
      else await adminCreateCategory(payload);
      showToast(modal.id ? 'Category updated' : 'Category created');
      setModal(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not save', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function deleteCategory() {
    setBusy(true);
    try {
      await adminDeleteCategory(confirm._id);
      showToast(`"${confirm.name}" deleted`);
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
        <p className="text-sm text-muted">Organize your catalog. Slugs are generated automatically from the name.</p>
        <button onClick={() => setModal({ id: null, name: '', description: '' })} className="btn-primary py-2.5">
          <PlusIcon size={16} strokeWidth={2.4} /> New Category
        </button>
      </div>

      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[680px]">
            <thead>
              <tr className="bg-[#FBFAF6] border-b border-[#EEEAE2]">
                <Th className="pl-5">Category</Th>
                <Th>Slug</Th>
                <Th>Description</Th>
                <Th className="text-right">Products</Th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-6"><Skeleton className="h-32 w-full" /></td></tr>
              ) : (
                categories.map((c) => (
                  <tr key={c._id} className="border-t border-[#F1EEE8] hover:bg-[#FBFAF6]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-[38px] h-[38px] rounded-[9px] bg-[#EEEDE8] flex items-center justify-center flex-shrink-0">
                          <ProductGlyph category={c.name} size={20} color="#5B615C" />
                        </span>
                        <span className="text-sm font-semibold">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <code className="text-[12.5px] text-muted bg-[#F4F2EC] px-2 py-1 rounded-md">{c.slug}</code>
                    </td>
                    <td className="px-3 py-3 text-[13.5px] text-muted max-w-[300px]">{c.description || '—'}</td>
                    <td className="px-3 py-3 text-right font-display font-bold text-sm tabular-nums">{counts[c._id] ?? '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <IconBtn title="Edit" onClick={() => setModal({ id: c._id, name: c.name, description: c.description || '' })}>
                          <EditIcon size={16} strokeWidth={1.9} />
                        </IconBtn>
                        <IconBtn title="Delete" danger onClick={() => setConfirm(c)}>
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
      </div>

      {/* Create / edit modal */}
      {modal && (
        <ModalShell title={modal.id ? 'Edit category' : 'New category'} onCancel={() => setModal(null)} onSave={saveCategory} saveLabel="Save category" busy={busy}>
          <Field label="Name" error={modal.err && 'Name is required'}>
            <input
              value={modal.name}
              onChange={(e) => setModal((m) => ({ ...m, name: e.target.value, err: false }))}
              placeholder="e.g. Outdoor"
              className="input"
            />
          </Field>
          <Field label="Slug · auto-generated">
            <div className="input bg-[#F4F2EC] text-fog">{slugify(modal.name) || '—'}</div>
          </Field>
          <Field label="Description">
            <textarea
              value={modal.description}
              onChange={(e) => setModal((m) => ({ ...m, description: e.target.value }))}
              rows={2}
              placeholder="Optional short description"
              className="input resize-y"
            />
          </Field>
        </ModalShell>
      )}

      {confirm && (
        <ConfirmDialog
          title="Delete category?"
          message={`"${confirm.name}" will be removed. Existing products keep their data but lose this category.`}
          confirmLabel="Delete category"
          busy={busy}
          onCancel={() => setConfirm(null)}
          onConfirm={deleteCategory}
        />
      )}
    </div>
  );
}

function Th({ children, className = '' }) {
  return <th className={`text-left text-[11px] font-bold tracking-wider text-fog uppercase px-3 py-3 ${className}`}>{children}</th>;
}

function IconBtn({ children, title, danger, onClick }) {
  return (
    <button onClick={onClick} title={title} className={`w-[34px] h-[34px] rounded-[9px] border border-line bg-white flex items-center justify-center ${danger ? 'text-sale hover:border-sale hover:bg-sale-bg' : 'text-[#3A3F3B] hover:border-ink hover:text-ink'}`}>
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

// Shared modal frame used by the category & coupon screens.
export function ModalShell({ title, children, onCancel, onSave, saveLabel, busy }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/50 backdrop-blur-[2px]" onClick={onCancel}>
      <div className="bg-white rounded-[18px] max-w-[480px] w-full shadow-hover" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-[#F1EEE8]">
          <h3 className="font-display font-bold text-lg tracking-tight">{title}</h3>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">{children}</div>
        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-[#F1EEE8] bg-[#FBFAF6]">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button onClick={onSave} disabled={busy} className="btn-primary">{busy ? 'Saving…' : saveLabel}</button>
        </div>
      </div>
    </div>
  );
}
