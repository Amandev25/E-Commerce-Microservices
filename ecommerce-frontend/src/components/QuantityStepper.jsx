import { PlusIcon, MinusIcon } from './Icons.jsx';

// A "− 2 +" control. `size` = "sm" (cart rows) or "md" (product detail).
export default function QuantityStepper({ value, onChange, size = 'md', min = 1 }) {
  const btn = size === 'sm' ? 'w-9 h-[38px]' : 'w-[42px] h-11';
  const box = size === 'sm' ? 'min-w-[38px] text-sm' : 'min-w-[46px] text-[15px]';

  function dec() {
    onChange(Math.max(min, value - 1));
  }
  function inc() {
    onChange(value + 1);
  }

  return (
    <div className="inline-flex items-center border border-line3 rounded-xl overflow-hidden">
      <button onClick={dec} className={`${btn} bg-white text-ink hover:bg-cream flex items-center justify-center`}>
        <MinusIcon size={16} />
      </button>
      <span className={`${box} text-center font-semibold tabular-nums`}>{value}</span>
      <button onClick={inc} className={`${btn} bg-white text-ink hover:bg-cream flex items-center justify-center`}>
        <PlusIcon size={16} />
      </button>
    </div>
  );
}
