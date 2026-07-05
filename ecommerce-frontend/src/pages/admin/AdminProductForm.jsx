import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProduct } from '../../api/products.js';
import { getCategories } from '../../api/categories.js';
import { adminCreateProduct, adminUpdateProduct, adminUploadImages } from '../../api/admin.js';
import { useToast } from '../../context/ToastContext.jsx';
import { ChevronLeftIcon, UploadIcon, XIcon } from '../../components/Icons.jsx';

const EMPTY = { name: '', description: '', price: '', stock: '', category: '' };

export default function AdminProductForm() {
  const { id } = useParams(); // present when editing
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const showToast = useToast();

  const fileInput = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // already-uploaded URLs
  const [newFiles, setNewFiles] = useState([]); // File objects to upload on save
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Load categories, and (when editing) the product itself.
  useEffect(() => {
    getCategories().then((res) => {
      setCategories(res.data);
      // Default the category dropdown to the first one for new products.
      if (!isEdit && res.data[0]) setForm((f) => ({ ...f, category: res.data[0]._id }));
    });
    if (isEdit) {
      getProduct(id).then((res) => {
        const p = res.data;
        setForm({
          name: p.name,
          description: p.description,
          price: String(p.price),
          stock: String(p.stock),
          category: p.category?._id || p.category || '',
        });
        setExistingImages(p.images || []);
      });
    }
  }, [id, isEdit]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (form.price === '' || isNaN(+form.price) || +form.price <= 0) e.price = 'Enter a price greater than 0';
    if (form.stock === '' || isNaN(+form.stock) || +form.stock < 0 || +form.stock % 1 !== 0) e.stock = 'Enter a whole number';
    if (!form.category) e.category = 'Pick a category';
    return e;
  }

  function onPickFiles(e) {
    setNewFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    e.target.value = ''; // let the same file be picked again
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return showToast('Please fix the highlighted fields', 'error');
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
      };
      // Create or update, then upload any new images to the product.
      const res = isEdit ? await adminUpdateProduct(id, payload) : await adminCreateProduct(payload);
      const productId = res.data._id;
      if (newFiles.length > 0) {
        await adminUploadImages(productId, newFiles);
      }
      showToast(isEdit ? 'Product updated' : 'Product created');
      navigate('/admin/products');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not save product', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-[860px]">
      <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-muted hover:text-ink mb-4">
        <ChevronLeftIcon size={15} strokeWidth={2.2} /> Back to products
      </Link>

      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#F1EEE8]">
          <h2 className="font-display font-bold text-lg tracking-tight">{isEdit ? 'Edit product' : 'New product'}</h2>
          <p className="text-[13.5px] text-fog mt-1">
            {isEdit ? 'Update the details below and save.' : 'Add a product to your catalog.'}
          </p>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <Field label="Product name" error={errors.name}>
            <input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Terra Ceramic Mug" className="input" />
          </Field>

          <Field label="Description" error={errors.description}>
            <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} rows={3} placeholder="Describe the product for the storefront…" className="input resize-y" />
          </Field>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Price (USD)" error={errors.price}>
              <input value={form.price} onChange={(e) => setField('price', e.target.value)} inputMode="decimal" placeholder="0.00" className="input" />
            </Field>
            <Field label="Stock quantity" error={errors.stock}>
              <input value={form.stock} onChange={(e) => setField('stock', e.target.value)} inputMode="numeric" placeholder="0" className="input" />
            </Field>
            <Field label="Category" error={errors.category}>
              <select value={form.category} onChange={(e) => setField('category', e.target.value)} className="input cursor-pointer">
                <option value="">Select…</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </Field>
          </div>

          {/* Images */}
          <div>
            <label className="block text-[13px] font-semibold text-[#3A3F3B] mb-2">Product images</label>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((url) => (
                <div key={url} className="w-24 h-24 rounded-xl overflow-hidden border border-line">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {newFiles.map((file, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-line">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setNewFiles((files) => files.filter((_, idx) => idx !== i))}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-white border-2 border-white flex items-center justify-center hover:bg-sale"
                  >
                    <XIcon size={12} strokeWidth={3} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInput.current?.click()}
                className="w-24 h-24 rounded-xl border-[1.5px] border-dashed border-[#C9C4B8] bg-[#FBFAF6] flex flex-col items-center justify-center gap-1.5 text-fog text-[11.5px] font-semibold hover:border-accent hover:text-accent"
              >
                <UploadIcon size={20} strokeWidth={1.9} /> Upload
              </button>
              <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={onPickFiles} />
            </div>
            <p className="text-xs text-mist mt-2">PNG or JPG, up to 2MB each. New images upload when you save.</p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-[#F1EEE8] bg-[#FBFAF6]">
          <Link to="/admin/products" className="btn-secondary">Cancel</Link>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save product'}
          </button>
        </div>
      </div>
    </div>
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
