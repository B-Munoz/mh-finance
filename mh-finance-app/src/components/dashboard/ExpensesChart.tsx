import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import type { Expense } from "../../types";
import { formatCOP, MONTHS_ES, QUARTERS, SEMESTERS } from "../../utils/locale";
import { Colors } from "../../utils/colors";

interface Props {
  expenses: Expense[];
}

type Period = "month" | "quarter" | "semester" | "year";

const PERIOD_LABELS: Record<Period, string> = {
  month: "Mes",
  quarter: "Trimestre",
  semester: "Semestre",
  year: "Ano",
};

export function ExpensesChart({ expenses }: Props) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [period, setPeriod] = useState<Period>("month");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil(currentMonth / 3));
  const [selectedSemester, setSelectedSemester] = useState(currentMonth <= 6 ? 1 : 2);

  const availableYears = Array.from(
    new Set(expenses.map((e) => new Date(e.date).getFullYear()).concat(currentYear))
  ).sort((a, b) => b - a);

  function filterExpenses(all: Expense[]): Expense[] {
    return all.filter((e) => {
      const d = new Date(e.date);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      if (y !== selectedYear) return false;
      if (period === "month") return m === selectedMonth;
      if (period === "quarter") return Math.ceil(m / 3) === selectedQuarter;
      if (period === "semester") return (m <= 6 ? 1 : 2) === selectedSemester;
      return true;
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

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  const periodLabel =
    period === "month"
      ? `${MONTHS_ES[selectedMonth - 1]} ${selectedYear}`
      : period === "quarter"
      ? `${QUARTERS[selectedQuarter - 1]} ${selectedYear}`
      : period === "semester"
      ? `${SEMESTERS[selectedSemester - 1]} ${selectedYear}`
      : `Ano ${selectedYear}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Gastos por Categoria — <Text style={styles.subtitle}>{periodLabel}</Text>
      </Text>

      {/* Period selector */}
      <View style={styles.segmented}>
        {(["month", "quarter", "semester", "year"] as Period[]).map((p) => (
          <Pressable
            key={p}
            style={[styles.segment, period === p && styles.segmentActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.segmentText, period === p && styles.segmentTextActive]}>
              {PERIOD_LABELS[p]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Sub-selectors */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chips}>
          {period === "month" &&
            MONTHS_ES.map((name, i) => (
              <Pressable
                key={i}
                style={[styles.chip, selectedMonth === i + 1 && styles.chipActive]}
                onPress={() => setSelectedMonth(i + 1)}
              >
                <Text style={[styles.chipText, selectedMonth === i + 1 && styles.chipTextActive]}>
                  {name.slice(0, 3)}
                </Text>
              </Pressable>
            ))}

          {period === "quarter" &&
            QUARTERS.map((_, i) => (
              <Pressable
                key={i}
                style={[styles.chip, selectedQuarter === i + 1 && styles.chipActive]}
                onPress={() => setSelectedQuarter(i + 1)}
              >
                <Text style={[styles.chipText, selectedQuarter === i + 1 && styles.chipTextActive]}>
                  T{i + 1}
                </Text>
              </Pressable>
            ))}

          {period === "semester" &&
            SEMESTERS.map((_, i) => (
              <Pressable
                key={i}
                style={[styles.chip, selectedSemester === i + 1 && styles.chipActive]}
                onPress={() => setSelectedSemester(i + 1)}
              >
                <Text style={[styles.chipText, selectedSemester === i + 1 && styles.chipTextActive]}>
                  S{i + 1}
                </Text>
              </Pressable>
            ))}

          {availableYears.map((y) => (
            <Pressable
              key={y}
              style={[styles.chip, selectedYear === y && styles.chipActive]}
              onPress={() => setSelectedYear(y)}
            >
              <Text style={[styles.chipText, selectedYear === y && styles.chipTextActive]}>
                {y}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {data.length === 0 ? (
        <Text style={styles.empty}>No hay gastos para este periodo</Text>
      ) : (
        <View style={styles.chart}>
          {data.map((item) => (
            <View key={item.category} style={styles.barRow}>
              <Text style={styles.barLabel} numberOfLines={1}>
                {item.category}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(item.amount / maxAmount) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>{formatCOP(item.amount)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.gray700,
  },
  subtitle: {
    fontWeight: "400",
    color: Colors.gray500,
  },
  segmented: {
    flexDirection: "row",
    backgroundColor: Colors.gray100,
    borderRadius: 8,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.gray500,
  },
  segmentTextActive: {
    color: Colors.gray800,
  },
  chips: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 11,
    color: Colors.gray600,
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    color: Colors.gray400,
    fontSize: 13,
    paddingVertical: 40,
  },
  chart: {
    gap: 10,
    marginTop: 4,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  barLabel: {
    width: 72,
    fontSize: 11,
    color: Colors.gray600,
    textAlign: "right",
  },
  barTrack: {
    flex: 1,
    height: 20,
    backgroundColor: Colors.gray100,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: 20,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  barValue: {
    width: 80,
    fontSize: 11,
    color: Colors.gray700,
    fontWeight: "500",
  },
});
