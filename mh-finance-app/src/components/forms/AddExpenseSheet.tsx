import React, { useState, useCallback, useMemo, useRef } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useConfig } from "../../hooks/useConfig";
import { useCreateExpense } from "../../hooks/useExpenses";
import { formatWithSeparator, parseAmount } from "../../utils/locale";
import { Colors } from "../../utils/colors";

interface Props {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
}

export function AddExpenseSheet({ bottomSheetRef }: Props) {
  const { data: config } = useConfig();
  const createExpense = useCreateExpense();
  const [displayAmount, setDisplayAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const snapPoints = useMemo(() => ["55%"], []);

  const categories = config?.categories ?? [];

  const handleSubmit = useCallback(() => {
    if (!displayAmount || !category) return;
    const amount = parseAmount(displayAmount);
    if (!amount) return;
    createExpense.mutate(
      { category, description, amount },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setDisplayAmount("");
          setDescription("");
          setCategory("");
          bottomSheetRef.current?.close();
        },
      }
    );
  }, [displayAmount, description, category, createExpense, bottomSheetRef]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>Add Expense</Text>

        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor={Colors.gray400}
          keyboardType="numeric"
          value={displayAmount}
          onChangeText={(t) => setDisplayAmount(formatWithSeparator(t))}
        />

        <TextInput
          style={styles.input}
          placeholder="Description (optional)"
          placeholderTextColor={Colors.gray400}
          value={description}
          onChangeText={setDescription}
        />

        {/* Category pills */}
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

        <Pressable
          style={[styles.button, createExpense.isPending && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={createExpense.isPending}
        >
          <Text style={styles.buttonText}>
            {createExpense.isPending ? "Adding..." : "Add Expense"}
          </Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  indicator: {
    backgroundColor: Colors.gray300,
    width: 36,
  },
  content: {
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.gray800,
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
  button: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
});
