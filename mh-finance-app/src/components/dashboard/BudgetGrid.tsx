import React from "react";
import { FlatList, Text, StyleSheet, View } from "react-native";
import { useBudgets } from "../../hooks/useBudgets";
import { BudgetCard } from "./BudgetCard";
import { Colors } from "../../utils/colors";

export function BudgetGrid() {
  const { data: budgets, isLoading } = useBudgets();

  if (isLoading) return <Text style={styles.loading}>Loading budgets...</Text>;
  if (!budgets?.length) return null;

  return (
    <FlatList
      data={budgets}
      keyExtractor={(b) => b.category}
      numColumns={2}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => <BudgetCard budget={item} />}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 12,
    marginBottom: 12,
  },
  loading: {
    color: Colors.gray400,
    fontSize: 13,
    padding: 8,
  },
});
