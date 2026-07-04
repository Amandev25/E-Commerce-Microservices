// All the little line-icons used in the design, as tiny React components.
// They all share the same look (rounded, 24x24 viewBox) via the <Svg> wrapper.

function Svg({ size = 20, stroke = 'currentColor', strokeWidth = 2, fill = 'none', children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4-4" />
  </Svg>
);

export const HeartIcon = ({ filled, ...p }) => (
  <Svg fill={filled ? 'currentColor' : 'none'} {...p}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </Svg>
);

export const BagIcon = (p) => (
  <Svg {...p}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </Svg>
);

export const PlusIcon = (p) => (
  <Svg {...p}>
    <path d="M5 12h14M12 5v14" />
  </Svg>
);

export const MinusIcon = (p) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);

export const ArrowRightIcon = (p) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const ArrowLeftIcon = (p) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);

export const ChevronDownIcon = (p) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const ChevronLeftIcon = (p) => (
  <Svg {...p}>
    <path d="m15 18-6-6 6-6" />
  </Svg>
);

export const ChevronRightIcon = (p) => (
  <Svg {...p}>
    <path d="m9 18 6-6-6-6" />
  </Svg>
);

export const TrashIcon = (p) => (
  <Svg {...p}>
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </Svg>
);

export const CheckIcon = (p) => (
  <Svg {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

export const XIcon = (p) => (
  <Svg {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

export const TruckIcon = (p) => (
  <Svg {...p}>
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18h4M14 9h4l4 4v4a1 1 0 0 1-1 1h-1" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </Svg>
);

export const RefreshIcon = (p) => (
  <Svg {...p}>
    <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.4 2.6L3 8" />
    <path d="M3 3v5h5" />
  </Svg>
);

export const ShieldIcon = (p) => (
  <Svg {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

export const LockIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

export const MailIcon = (p) => (
  <Svg {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 6 10-6" />
  </Svg>
);

export const EyeIcon = (p) => (
  <Svg {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const UserIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Svg>
);

export const BoltIcon = (p) => (
  <Svg {...p}>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </Svg>
);

export const GithubArrowIcon = (p) => (
  <Svg {...p}>
    <path d="M7 17 17 7M17 7H8M17 7v9" />
  </Svg>
);

// ---- Category "product" glyphs (used when a product has no image) ----
const GLYPHS = {
  lamp: ['M9 3h6l3 8H6z', 'M12 11v8', 'M8.5 21h7'],
  mug: ['M5 8h10v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z', 'M15 9h2.4a2.5 2.5 0 0 1 0 5H15', 'M8 3v2', 'M11 3v2'],
  headphones: [
    'M4 13v-1a8 8 0 0 1 16 0v1',
    'M4.5 13a2 2 0 0 1 2 2v2.5a2 2 0 0 1-4 0V15a2 2 0 0 1 2-2z',
    'M19.5 13a2 2 0 0 1 2 2v2.5a2 2 0 0 1-4 0V15a2 2 0 0 1 2-2z',
  ],
  shirt: ['M8 3 4 6l2.2 3L8 8v11h8V8l1.8 1L20 6l-4-3-2 2.2a3 3 0 0 1-4 0z'],
  serum: ['M9.5 2h5', 'M10.5 2v3', 'M13.5 2v3', 'M8 9a4 4 0 0 1 8 0v8a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3z', 'M8 12.5h8'],
  plant: [
    'M12 22V10',
    'M12 10C12 6.5 9.2 4 5.5 4 5.5 7.5 8.3 10 12 10',
    'M12 10c0-3 2.4-5.5 5.8-5.5C17.8 7.5 15.4 10 12 10',
    'M8 22h8',
  ],
  box: ['M21 8 12 3 3 8l9 5 9-5z', 'M3 8v8l9 5 9-5V8', 'M12 13v8'],
};

// Pick a glyph based on the product's category name. Falls back to a box.
export function glyphForCategory(categoryName = '') {
  const name = categoryName.toLowerCase();
  if (name.includes('home') || name.includes('living')) return 'lamp';
  if (name.includes('kitchen')) return 'mug';
  if (name.includes('tech')) return 'headphones';
  if (name.includes('apparel') || name.includes('cloth')) return 'shirt';
  if (name.includes('beauty')) return 'serum';
  if (name.includes('outdoor') || name.includes('garden')) return 'plant';
  return 'box';
}

export function ProductGlyph({ category, size = 46, color = '#B0AB9E' }) {
  const paths = GLYPHS[glyphForCategory(category)] || GLYPHS.box;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
