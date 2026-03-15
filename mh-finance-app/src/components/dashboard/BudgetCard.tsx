import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { Budget } from "../../types";
import { formatCOP } from "../../utils/locale";
import { Colors } from "../../utils/colors";
import { ProgressBar } from "../common/ProgressBar";

interface Props {
  budget: Budget;
}

export function BudgetCard({ budget }: Props) {
  const { category, current_balance, limit } = budget;
  const hasLimit = limit > 0;
  const progress = hasLimit ? Math.min(Math.max(current_balance / limit, 0), 1) : 1;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.category} numberOfLines={1}>
          {category}
        </Text>
        {hasLimit && (
          <Text style={styles.limit}>/ {formatCOP(limit)}</Text>
        )}
      </View>
      <Text style={styles.balance}>{formatCOP(current_balance)}</Text>
      {hasLimit && <ProgressBar progress={progress} hasLimit={hasLimit} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 8,
    minWidth: 150,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  category: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.gray700,
    flex: 1,
  },
  limit: {
    fontSize: 11,
    color: Colors.gray400,
  },
  balance: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.gray800,
  },
});
