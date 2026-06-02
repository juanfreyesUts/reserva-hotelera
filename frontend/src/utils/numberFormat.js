/**
 * Formats a number string with thousands separator (dot).
 * Example: "1000000" → "1.000.000"
 */
export function formatThousands(value) {
  const digits = String(value).replaceAll(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('es-CO');
}

/**
 * Strips thousands separators, returning a plain digit string.
 * Example: "1.000.000" → "1000000"
 */
export function parseThousands(value) {
  return String(value).replaceAll('.', '').replaceAll(/\D/g, '');
}

/**
 * Formats a number as Colombian pesos (COP).
 * Example: 150000 → "$ 150.000"
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
}
