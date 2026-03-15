import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { Expense } from "../../types";
import { formatCOP, MONTHS_ES } from "../../utils/locale";
import { Colors } from "../../utils/colors";

interface Props {
  expenses: Expense[];
}

export function MetricsRow({ expenses }: Props) {
  const now = new Date();
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const monthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);
  const count = thisMonth.length;
  const monthLabel = MONTHS_ES[now.getMonth()];

  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <Text style={styles.label}>SPENT IN {monthLabel.toUpperCase()}</Text>
        <Text style={styles.value}>{formatCOP(monthTotal)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>TRANSACTIONS</Text>
        <Text style={styles.value}>{count}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.gray500,
    letterSpacing: 1,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.gray800,
    marginTop: 4,
  },
});
