"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Expense } from "@/types";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";

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

function getYear(date: string) { return new Date(date).getFullYear(); }
function getMonth(date: string) { return new Date(date).getMonth() + 1; }

export function ExpensesChart({ expenses }: Props) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [period, setPeriod] = useState<Period>("month");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil(currentMonth / 3));
  const [selectedSemester, setSelectedSemester] = useState(currentMonth <= 6 ? 1 : 2);

  const availableYears = Array.from(new Set(expenses.map((e) => getYear(e.date))));
  if (!availableYears.includes(currentYear)) availableYears.push(currentYear);
  availableYears.sort((a, b) => b - a);

  const filtered = expenses.filter((e) => {
    const y = getYear(e.date);
    const m = getMonth(e.date);
    if (y !== selectedYear) return false;
    if (period === "month") return m === selectedMonth;
    if (period === "quarter") return Math.ceil(m / 3) === selectedQuarter;
    if (period === "semester") return (m <= 6 ? 1 : 2) === selectedSemester;
    return true;
  });

  const byCategory: Record<string, number> = {};
  for (const e of filtered) byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
  const data = Object.entries(byCategory).map(([category, amount]) => ({ category, amount }));

  const periodLabel =
    period === "month" ? `${MONTHS_ES[selectedMonth - 1]} ${selectedYear}`
    : period === "quarter" ? `${QUARTERS[selectedQuarter - 1]} ${selectedYear}`
    : period === "semester" ? `${SEMESTERS[selectedSemester - 1]} ${selectedYear}`
    : `Año ${selectedYear}`;

  return (
    <Card padding="sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <p className="text-sm font-semibold text-gray-100 flex-1">
          Gastos por Categoría — <span className="text-sidebar-muted font-normal">{periodLabel}</span>
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          <Select uiSize="sm" value={period} onChange={(e) => setPeriod(e.target.value as Period)} className="w-auto">
            <option value="month">Mes</option>
            <option value="quarter">Trimestre</option>
            <option value="semester">Semestre</option>
            <option value="year">Año</option>
          </Select>
          {period === "month" && (
            <Select uiSize="sm" value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="w-auto">
              {MONTHS_ES.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
            </Select>
          )}
          {period === "quarter" && (
            <Select uiSize="sm" value={selectedQuarter} onChange={(e) => setSelectedQuarter(Number(e.target.value))} className="w-auto">
              {QUARTERS.map((label, i) => <option key={i + 1} value={i + 1}>{label}</option>)}
            </Select>
          )}
          {period === "semester" && (
            <Select uiSize="sm" value={selectedSemester} onChange={(e) => setSelectedSemester(Number(e.target.value))} className="w-auto">
              {SEMESTERS.map((label, i) => <option key={i + 1} value={i + 1}>{label}</option>)}
            </Select>
          )}
          <Select uiSize="sm" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="w-auto">
            {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-10">No hay gastos para este período</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v: number) => `$${v.toLocaleString("es-CO", { maximumFractionDigits: 2 })}`}
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
              labelStyle={{ color: "#f1f5f9" }}
              itemStyle={{ color: "#f1f5f9" }}
            />
            <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
