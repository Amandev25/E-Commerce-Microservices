import { Link } from 'react-router-dom';
import { BagIcon } from './Icons.jsx';

// A friendly "nothing here yet" block with an optional call-to-action button.
export default function EmptyState({
  icon = <BagIcon size={34} strokeWidth={1.6} stroke="#C7C3B8" />,
  title = 'Nothing here yet',
  subtitle = '',
  actionLabel,
  actionTo,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon}
      <div className="text-base font-semibold mt-3">{title}</div>
      {subtitle && <div className="text-sm text-fog mt-1">{subtitle}</div>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary mt-5">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
