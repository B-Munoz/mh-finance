import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Swipeable } from "react-native-gesture-handler";
import { useExpenses, useBulkUpdateExpenses, useDeleteExpense } from "../hooks/useExpenses";
import { useConfig } from "../hooks/useConfig";
import type { Expense } from "../types";
import { formatCOP, formatDate, formatWithSeparator, parseAmount } from "../utils/locale";
import { Colors } from "../utils/colors";

function EditModal({
  expense,
  categories,
  onSave,
  onClose,
}: {
  expense: Expense;
  categories: string[];
  onSave: (updated: Expense) => void;
  onClose: () => void;
}) {
  const [category, setCategory] = useState(expense.category);
  const [description, setDescription] = useState(expense.description);
  const [displayAmount, setDisplayAmount] = useState(
    formatWithSeparator(Math.round(expense.amount).toString())
  );

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Edit Transaction</Text>
          <Text style={styles.modalDate}>{formatDate(expense.date)}</Text>

          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.pills}>
            {categories.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.pill, category === cat && styles.pillActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Description"
            placeholderTextColor={Colors.gray400}
            value={description}
            onChangeText={setDescription}
          />

          <TextInput
            style={styles.input}
            placeholder="Amount"
            placeholderTextColor={Colors.gray400}
            keyboardType="numeric"
            value={displayAmount}
            onChangeText={(t) => setDisplayAmount(formatWithSeparator(t))}
          />

          <View style={styles.modalButtons}>
            <Pressable
              style={styles.saveButton}
              onPress={() => {
                const amount = parseAmount(displayAmount);
                if (!amount) return;
                onSave({ ...expense, category, description, amount });
              }}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function TransactionsScreen() {
  const { data: expenses = [], isLoading, refetch } = useExpenses();
  const { data: config } = useConfig();
  const bulkUpdate = useBulkUpdateExpenses();
  const deleteExpenseMut = useDeleteExpense();
  const [localExpenses, setLocalExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [dirty, setDirty] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const categories = config?.categories ?? [];

  useEffect(() => {
    setLocalExpenses(
      [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    setDirty(false);
  }, [expenses]);

  function handleEdit(updated: Expense) {
    setLocalExpenses((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    );
    setDirty(true);
    setEditingExpense(null);
  }

  function handleDelete(expense: Expense) {
    Alert.alert("Delete Transaction", `Delete "${expense.description || expense.category}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          deleteExpenseMut.mutate(expense.id);
        },
      },
    ]);
  }

  function handleSave() {
    bulkUpdate.mutate(localExpenses, {
      onSuccess: () => {
        setDirty(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
    });
  }

  function handleDiscard() {
    setLocalExpenses(
      [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    setDirty(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  function renderRightActions() {
    return (
      <View style={styles.swipeDelete}>
        <Ionicons name="trash-outline" size={20} color={Colors.white} />
      </View>
    );
  }

  function renderItem({ item }: { item: Expense }) {
    return (
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableOpen={() => handleDelete(item)}
      >
        <Pressable style={styles.row} onPress={() => setEditingExpense(item)}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowCategory}>{item.category}</Text>
            <Text style={styles.rowDesc} numberOfLines={1}>
              {item.description || "—"}
            </Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowAmount}>{formatCOP(item.amount)}</Text>
            <Text style={styles.rowDate}>{formatDate(item.date)}</Text>
          </View>
        </Pressable>
      </Swipeable>
    );
  }

  return (
    <View style={styles.container}>
      {dirty && (
        <View style={styles.dirtyBar}>
          <Pressable style={styles.saveBtn} onPress={handleSave} disabled={bulkUpdate.isPending}>
            <Text style={styles.saveBtnText}>
              {bulkUpdate.isPending ? "Saving..." : "Save Changes"}
            </Text>
          </Pressable>
          <Pressable style={styles.discardBtn} onPress={handleDiscard}>
            <Text style={styles.discardBtnText}>Discard</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={localExpenses}
        keyExtractor={(e) => e.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.empty}>Loading...</Text>
          ) : (
            <Text style={styles.empty}>No transactions yet</Text>
          )
        }
      />

      {editingExpense && (
        <EditModal
          expense={editingExpense}
          categories={categories}
          onSave={handleEdit}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  rowLeft: {
    flex: 1,
    gap: 2,
  },
  rowCategory: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray800,
  },
  rowDesc: {
    fontSize: 12,
    color: Colors.gray500,
  },
  rowRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray800,
  },
  rowDate: {
    fontSize: 11,
    color: Colors.gray400,
  },
  swipeDelete: {
    backgroundColor: Colors.red,
    justifyContent: "center",
    alignItems: "center",
    width: 72,
  },
  dirtyBar: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  discardBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  discardBtnText: {
    color: Colors.gray700,
    fontSize: 14,
    fontWeight: "500",
  },
  empty: {
    textAlign: "center",
    color: Colors.gray400,
    fontSize: 13,
    padding: 40,
  },
  // Edit Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    gap: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.gray800,
  },
  modalDate: {
    fontSize: 13,
    color: Colors.gray500,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.gray500,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.gray50,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 13,
    color: Colors.gray600,
  },
  pillTextActive: {
    color: Colors.white,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: Colors.gray800,
    backgroundColor: Colors.gray50,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.gray700,
    fontSize: 15,
    fontWeight: "500",
  },
});
