import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useIncomes, useDeleteIncome } from "../../hooks/useIncomes";
import type { IncomeRecord } from "../../types";
import { formatCOP, formatDate } from "../../utils/locale";
import { Colors } from "../../utils/colors";
import * as Haptics from "expo-haptics";

function IncomeRow({ record }: { record: IncomeRecord }) {
  const [expanded, setExpanded] = useState(false);
  const deleteIncome = useDeleteIncome();

  function handleDelete() {
    Alert.alert("Delete Income", "This will reverse all allocations. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          deleteIncome.mutate(record.id);
        },
      },
    ]);
  }

  const breakdownEntries = Object.entries(record.allocations).filter(([, amt]) => amt > 0);

  return (
    <View style={styles.rowContainer}>
      <View style={styles.row}>
        <Text style={styles.date}>{formatDate(record.date)}</Text>
        <Text style={styles.amount}>{formatCOP(record.amount)}</Text>
        <Pressable onPress={() => setExpanded((v) => !v)} style={styles.toggleBtn}>
          <Text style={styles.toggleText}>{expanded ? "Hide" : "Show"}</Text>
        </Pressable>
        <Pressable
          onPress={handleDelete}
          disabled={deleteIncome.isPending}
          style={styles.deleteBtn}
        >
          <Text style={[styles.deleteText, deleteIncome.isPending && styles.disabled]}>
            ✕
          </Text>
        </Pressable>
      </View>

      {expanded && (
        <View style={styles.breakdown}>
          {breakdownEntries.map(([cat, amt]) => (
            <View key={cat} style={styles.breakdownRow}>
              <Text style={styles.breakdownCat}>{cat}</Text>
              <Text style={styles.breakdownAmt}>{formatCOP(amt)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const PAGE_SIZE = 5;

export function IncomeHistory() {
  const { data: incomes = [], isLoading } = useIncomes();
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? incomes : incomes.slice(0, PAGE_SIZE);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Income History</Text>
      </View>

      {isLoading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : incomes.length === 0 ? (
        <Text style={styles.empty}>No income records yet</Text>
      ) : (
        <>
          {visible.map((record) => (
            <IncomeRow key={record.id} record={record} />
          ))}

          {incomes.length > PAGE_SIZE && (
            <Pressable
              style={styles.showAllBtn}
              onPress={() => setShowAll((v) => !v)}
            >
              <Text style={styles.showAllText}>
                {showAll ? "Show less" : `Show all ${incomes.length} entries`}
              </Text>
            </Pressable>
          )}
        </>
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
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.gray700,
  },
  loading: {
    textAlign: "center",
    color: Colors.gray400,
    fontSize: 13,
    padding: 32,
  },
  empty: {
    textAlign: "center",
    color: Colors.gray400,
    fontSize: 13,
    padding: 32,
  },
  rowContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  date: {
    flex: 1,
    fontSize: 13,
    color: Colors.gray600,
  },
  amount: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.gray800,
    marginRight: 12,
  },
  toggleBtn: {
    marginRight: 12,
  },
  toggleText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "500",
  },
  deleteBtn: {
    padding: 4,
  },
  deleteText: {
    fontSize: 12,
    color: Colors.red,
  },
  disabled: {
    opacity: 0.5,
  },
  breakdown: {
    backgroundColor: Colors.gray50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
    gap: 4,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownCat: {
    fontSize: 12,
    color: Colors.gray600,
  },
  breakdownAmt: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.gray600,
  },
  showAllBtn: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: "center",
  },
  showAllText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "500",
  },
});
