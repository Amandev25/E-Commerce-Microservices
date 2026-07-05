import { AlertTriangleIcon } from '../Icons.jsx';

// A centered "are you sure?" modal used before destructive actions (delete).
// Render it conditionally: {confirm && <ConfirmDialog ... />}
export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel, busy }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/50 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div className="bg-white rounded-[18px] max-w-[420px] w-full p-6 shadow-hover" onClick={(e) => e.stopPropagation()}>
        <div className="w-[52px] h-[52px] rounded-[14px] bg-sale-bg text-sale flex items-center justify-center mb-4">
          <AlertTriangleIcon size={24} strokeWidth={2} />
        </div>
        <h3 className="font-display font-bold text-[19px] tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-muted leading-relaxed mb-6">{message}</p>
        <div className="flex gap-2.5">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="btn flex-1 bg-sale text-white hover:brightness-95"
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
