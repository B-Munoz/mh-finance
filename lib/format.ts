export function formatCurrency(n: number): string {
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

export function formatWithSeparator(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

export function parseAmount(formatted: string): number {
  return parseFloat(formatted.replace(/\./g, ""));
}

export function calcAllocationAmount(pct: number, sampleIncome: number): number {
  return (pct / 100) * sampleIncome;
}
