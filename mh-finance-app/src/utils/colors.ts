/**
 * Budget threshold color logic — discrete gradient from green (full) to red (empty).
 */
export function getBarColor(pct: number): string {
  if (pct >= 75) return "#16a34a"; // green-600
  if (pct >= 50) return "#ca8a04"; // yellow-600
  if (pct >= 25) return "#ea580c"; // orange-600
  return "#dc2626"; // red-600
}

/** iOS-friendly color palette */
export const Colors = {
  primary: "#3b82f6",     // blue-500
  primaryDark: "#2563eb",  // blue-600
  green: "#16a34a",
  greenLight: "#f0fdf4",
  red: "#dc2626",
  redLight: "#fef2f2",
  purple: "#9333ea",
  purpleDark: "#7c3aed",
  orange: "#ea580c",
  yellow: "#ca8a04",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  white: "#ffffff",
  black: "#000000",
  background: "#f9fafb",
  card: "#ffffff",
  border: "#e5e7eb",
  blue400: "#60a5fa",
};
