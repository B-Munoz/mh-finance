/**
 * Manual COP formatting for Hermes (lacks full Intl support).
 * Uses period as thousands separator (es-CO style).
 */
export function formatCOP(n: number): string {
  const rounded = Math.round(n);
  const abs = Math.abs(rounded);
  const str = abs.toString();
  let result = "";
  for (let i = 0; i < str.length; i++) {
    if (i > 0 && (str.length - i) % 3 === 0) result += ".";
    result += str[i];
  }
  return (rounded < 0 ? "-" : "") + "$" + result;
}

/**
 * Format with separator only (no $ prefix) for input fields.
 */
export function formatWithSeparator(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10);
  const str = num.toString();
  let result = "";
  for (let i = 0; i < str.length; i++) {
    if (i > 0 && (str.length - i) % 3 === 0) result += ".";
    result += str[i];
  }
  return result;
}

/**
 * Parse a formatted string (with period separators) to a number.
 */
export function parseAmount(formatted: string): number {
  return parseFloat(formatted.replace(/\./g, "")) || 0;
}

/**
 * Format a date string to es-CO locale style (DD/MM/YYYY).
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const QUARTERS = ["T1 (Ene\u2013Mar)", "T2 (Abr\u2013Jun)", "T3 (Jul\u2013Sep)", "T4 (Oct\u2013Dic)"];
export const SEMESTERS = ["S1 (Ene\u2013Jun)", "S2 (Jul\u2013Dic)"];
