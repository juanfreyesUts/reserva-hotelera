/**
 * Formats a date string (YYYY-MM-DD or ISO) as "DD de MMMM de AAAA" in Spanish.
 * Example: "2026-04-02" → "02 de abril de 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = String(dateStr).split('T')[0].split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
}
