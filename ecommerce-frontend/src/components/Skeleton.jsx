// A shimmering placeholder shown while data loads. `className` sets its size.
export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`rounded-xl bg-[length:200%_100%] animate-shine ${className}`}
      style={{ backgroundImage: 'linear-gradient(100deg,#F1EEE8 30%,#E7E3DA 50%,#F1EEE8 70%)' }}
    />
  );
}

// A grid of product-card skeletons — reused on Home and the listing page.
export function ProductGridSkeleton({ count = 8, columns = 4 }) {
  const cols = { 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' }[columns] || 'md:grid-cols-4';
  return (
    <div className={`grid grid-cols-2 ${cols} gap-5`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <Skeleton className="aspect-square rounded-none" />
          <div className="p-4 flex flex-col gap-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
