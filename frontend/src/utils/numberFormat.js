/**
 * Formats a number string with thousands separator (dot).
 * Example: "1000000" → "1.000.000"
 */
export function formatThousands(value) {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('es-CO');
}

/**
 * Strips thousands separators, returning a plain digit string.
 * Example: "1.000.000" → "1000000"
 */
export function parseThousands(value) {
  return String(value).replace(/\./g, '').replace(/\D/g, '');
}
