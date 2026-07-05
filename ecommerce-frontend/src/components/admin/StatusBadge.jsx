// Small coloured pills for order status and payment status, reused across the
// admin screens (dashboard, orders list, order detail).

const STATUS_STYLES = {
  pending: 'bg-[#FBF3E2] text-[#9A6B12]',
  processing: 'bg-[#EAF0FB] text-[#2E5AAC]',
  shipped: 'bg-[#EDEBF9] text-[#5B3FB0]',
  delivered: 'bg-accent-tint text-accent',
  cancelled: 'bg-sale-bg text-sale',
};

const PAYMENT_STYLES = {
  paid: 'bg-accent-tint text-accent',
  unpaid: 'bg-[#F1EEE8] text-fog',
  failed: 'bg-sale-bg text-sale',
};

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${
        STATUS_STYLES[status] || 'bg-[#F1EEE8] text-fog'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function PaymentBadge({ status }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${
        PAYMENT_STYLES[status] || 'bg-[#F1EEE8] text-fog'
      }`}
    >
      {status}
    </span>
  );
}
