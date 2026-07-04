import { ProductGlyph } from './Icons.jsx';

// Shows the product's photo if it has one. If not (common with demo data),
// it falls back to a tinted tile with a line-icon based on the category —
// which keeps the storefront looking intentional even without real images.
export default function ProductImage({ product, className = '', glyphSize = 46 }) {
  const image = product.images && product.images[0];
  const categoryName =
    typeof product.category === 'object' ? product.category?.name : '';

  if (image) {
    return (
      <img
        src={image}
        alt={product.name}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`w-full h-full flex items-center justify-center bg-[#EEEDE8] ${className}`}>
      <ProductGlyph category={categoryName} size={glyphSize} />
    </div>
  );
}
