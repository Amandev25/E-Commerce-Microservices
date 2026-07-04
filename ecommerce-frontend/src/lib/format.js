// Small formatting helpers used across the app.

// Turn a number like 1499 into "$1,499".
export function money(amount) {
  const n = Number(amount) || 0;
  return '$' + n.toLocaleString('en-US');
}

// Turn a rating (0–5) into a CSS width like "96%" so we can draw
// partially-filled gold stars over grey ones.
export function starWidth(rating) {
  const r = Number(rating) || 0;
  return ((r / 5) * 100).toFixed(1) + '%';
}

// Build initials from a name, e.g. "Priya Sharma" -> "PS".
export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}
