import React, { useState, useCallback, useMemo } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useAllocateIncome, useDirectDeposit } from "../../hooks/useBudgets";
import { useConfig } from "../../hooks/useConfig";
import { formatWithSeparator, parseAmount, formatCOP } from "../../utils/locale";
import { Colors } from "../../utils/colors";

interface Props {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
}

export function IncomeSheet({ bottomSheetRef }: Props) {
  const allocate = useAllocateIncome();
  const deposit = useDirectDeposit();
  const { data: config } = useConfig();
  const [mode, setMode] = useState<"allocate" | "direct">("allocate");
  const [displayValue, setDisplayValue] = useState("");
  const [directCategory, setDirectCategory] = useState("");
  const [breakdown, setBreakdown] = useState<Record<string, number> | null>(null);
  const snapPoints = useMemo(() => ["65%"], []);

  const categories = config?.categories ?? [];

  const handleSubmit = useCallback(() => {
    if (!displayValue) return;
    const amount = parseAmount(displayValue);
    if (!amount) return;

    if (mode === "allocate") {
      allocate.mutate(amount, {
        onSuccess: (data) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setBreakdown(data.allocations);
          setDisplayValue("");
        },
      });
    } else {
      if (!directCategory) return;
      deposit.mutate(
        { category: directCategory, amount },
        {
          onSuccess: (data) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setBreakdown({ [data.category]: data.amount });
            setDisplayValue("");
            setDirectCategory("");
          },
        }
      );
    }
  }, [mode, displayValue, directCategory, allocate, deposit]);

  const isPending = mode === "allocate" ? allocate.isPending : deposit.isPending;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.indicator}
      onChange={(idx) => { if (idx === -1) setBreakdown(null); }}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>Add Income</Text>

        {/* Mode toggle */}
        <View style={styles.segmented}>
          <Pressable
            style={[styles.segment, mode === "allocate" && styles.segmentActive]}
            onPress={() => { setMode("allocate"); setBreakdown(null); }}
          >
            <Text style={[styles.segmentText, mode === "allocate" && styles.segmentTextActive]}>
              Allocate
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segment, mode === "direct" && styles.segmentActive]}
            onPress={() => { setMode("direct"); setBreakdown(null); }}
          >
            <Text style={[styles.segmentText, mode === "direct" && styles.segmentTextActive]}>
              Direct
            </Text>
          </Pressable>
        </View>

        {mode === "direct" && (
          <>
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.pills}>
              {categories.map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.pill, directCategory === cat && styles.pillActive]}
                  onPress={() => setDirectCategory(cat)}
                >
                  <Text style={[styles.pillText, directCategory === cat && styles.pillTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Income Amount"
          placeholderTextColor={Colors.gray400}
          keyboardType="numeric"
          value={displayValue}
          onChangeText={(t) => setDisplayValue(formatWithSeparator(t))}
        />

        <Pressable
          style={[styles.button, isPending && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isPending}
        >
          <Text style={styles.buttonText}>
            {isPending
              ? mode === "allocate" ? "Allocating..." : "Depositing..."
              : mode === "allocate" ? "Allocate Income" : "Direct Deposit"}
          </Text>
        </Pressable>

        {breakdown && (
          <View style={styles.breakdownBox}>
            <Text style={styles.breakdownTitle}>
              {mode === "allocate" ? "Allocation Breakdown" : "Deposited"}
            </Text>
            {Object.entries(breakdown)
              .filter(([, amt]) => amt > 0)
              .map(([cat, amt]) => (
                <View key={cat} style={styles.breakdownRow}>
                  <Text style={styles.breakdownCat}>{cat}</Text>
                  <Text style={styles.breakdownAmt}>+{formatCOP(amt)}</Text>
                </View>
              ))}
          </View>
        )}
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
  segmented: {
    flexDirection: "row",
    backgroundColor: Colors.gray100,
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 8,
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
    fontSize: 13,
    fontWeight: "500",
    color: Colors.gray500,
  },
  segmentTextActive: {
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
    backgroundColor: Colors.green,
    borderColor: Colors.green,
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
    backgroundColor: Colors.green,
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
  breakdownBox: {
    backgroundColor: Colors.greenLight,
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownCat: {
    fontSize: 13,
    fontWeight: "500",
    color: "#166534",
  },
  breakdownAmt: {
    fontSize: 13,
    color: "#166534",
  },
});
