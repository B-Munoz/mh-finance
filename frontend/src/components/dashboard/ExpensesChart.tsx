import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Expense } from "../../types";

interface Props {
  expenses: Expense[];
}

type Period = "month" | "quarter" | "semester" | "year";

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const QUARTERS = ["T1 (Ene–Mar)", "T2 (Abr–Jun)", "T3 (Jul–Sep)", "T4 (Oct–Dic)"];
const SEMESTERS = ["S1 (Ene–Jun)", "S2 (Jul–Dic)"];

function getExpenseYear(date: string): number {
  return new Date(date).getFullYear();
}
function getExpenseMonth(date: string): number {
  return new Date(date).getMonth() + 1; // 1–12
}

function getAvailableYears(expenses: Expense[]): number[] {
  const years = new Set(expenses.map((e) => getExpenseYear(e.date)));
  return Array.from(years).sort((a, b) => b - a);
}

export function ExpensesChart({ expenses }: Props) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [period, setPeriod] = useState<Period>("month");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil(currentMonth / 3));
  const [selectedSemester, setSelectedSemester] = useState(currentMonth <= 6 ? 1 : 2);

  const availableYears = getAvailableYears(expenses);
  if (!availableYears.includes(currentYear)) availableYears.push(currentYear);
  availableYears.sort((a, b) => b - a);

  function filterExpenses(all: Expense[]): Expense[] {
    return all.filter((e) => {
      const y = getExpenseYear(e.date);
      const m = getExpenseMonth(e.date);
      if (y !== selectedYear) return false;
      if (period === "month") return m === selectedMonth;
      if (period === "quarter") {
        const q = Math.ceil(m / 3);
        return q === selectedQuarter;
      }
      if (period === "semester") {
        const s = m <= 6 ? 1 : 2;
        return s === selectedSemester;
      }
      return true; // year
    });
  }

  const filtered = filterExpenses(expenses);

  const byCategory: Record<string, number> = {};
  for (const e of filtered) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
  }
  const data = Object.entries(byCategory).map(([category, amount]) => ({
    category,
    amount: Math.round(amount),
  }));

  const periodLabel =
    period === "month"
      ? `${MONTHS_ES[selectedMonth - 1]} ${selectedYear}`
      : period === "quarter"
      ? `${QUARTERS[selectedQuarter - 1]} ${selectedYear}`
      : period === "semester"
      ? `${SEMESTERS[selectedSemester - 1]} ${selectedYear}`
      : `Año ${selectedYear}`;

  return (
    <div className="bg-white rounded-lg border p-4">
      {/* Header + period controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <p className="text-sm font-semibold text-gray-700 flex-1">
          Gastos por Categoría — <span className="text-gray-500 font-normal">{periodLabel}</span>
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Period type selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="border rounded px-2 py-1 text-xs text-gray-600"
          >
            <option value="month">Mes</option>
            <option value="quarter">Trimestre</option>
            <option value="semester">Semestre</option>
            <option value="year">Año</option>
          </select>

          {/* Month selector */}
          {period === "month" && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border rounded px-2 py-1 text-xs text-gray-600"
            >
              {MONTHS_ES.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
          )}

          {/* Quarter selector */}
          {period === "quarter" && (
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(Number(e.target.value))}
              className="border rounded px-2 py-1 text-xs text-gray-600"
            >
              {QUARTERS.map((label, i) => (
                <option key={i + 1} value={i + 1}>{label}</option>
              ))}
            </select>
          )}

          {/* Semester selector */}
          {period === "semester" && (
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              className="border rounded px-2 py-1 text-xs text-gray-600"
            >
              {SEMESTERS.map((label, i) => (
                <option key={i + 1} value={i + 1}>{label}</option>
              ))}
            </select>
          )}

          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded px-2 py-1 text-xs text-gray-600"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-10">No hay gastos para este período</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <XAxis dataKey="category" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => `$${v.toLocaleString("es-CO")}`} />
            <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
