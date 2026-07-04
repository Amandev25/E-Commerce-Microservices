import { starWidth } from '../lib/format.js';

// Draws 5 grey stars with gold stars overlaid on top, clipped to the rating.
// e.g. rating 4.0 shows 80% gold. `size` controls the font size in px.
export default function StarRating({ rating = 0, size = 13 }) {
  return (
    <div className="relative leading-none" style={{ fontSize: size, letterSpacing: 1 }}>
      <div className="text-[#DFDCD3]">★★★★★</div>
      <div
        className="absolute inset-0 overflow-hidden whitespace-nowrap text-star"
        style={{ width: starWidth(rating) }}
      >
        ★★★★★
      </div>
    </div>
  );
}
