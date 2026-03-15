import React, { useState, useCallback, useMemo } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useConfig } from "../../hooks/useConfig";
import { useRelocateBudget } from "../../hooks/useBudgets";
import { formatWithSeparator, parseAmount } from "../../utils/locale";
import { Colors } from "../../utils/colors";

interface Props {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
}

export function RelocateSheet({ bottomSheetRef }: Props) {
  const { data: config } = useConfig();
  const relocate = useRelocateBudget();
  const [fromCat, setFromCat] = useState("");
  const [toCat, setToCat] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");
  const snapPoints = useMemo(() => ["60%"], []);

  const categories = config?.categories ?? [];

  const handleSubmit = useCallback(() => {
    if (!fromCat || !toCat || !displayAmount || fromCat === toCat) return;
    const amount = parseAmount(displayAmount);
    if (!amount) return;
    relocate.mutate(
      { from_category: fromCat, to_category: toCat, amount },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setDisplayAmount("");
          setFromCat("");
          setToCat("");
          bottomSheetRef.current?.close();
        },
      }
    );
  }, [fromCat, toCat, displayAmount, relocate, bottomSheetRef]);

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
        <Text style={styles.title}>Relocate Budget</Text>

        <Text style={styles.fieldLabel}>From</Text>
        <View style={styles.pills}>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[styles.pill, fromCat === cat && styles.pillActiveFrom]}
              onPress={() => { setFromCat(cat); if (toCat === cat) setToCat(""); }}
            >
              <Text style={[styles.pillText, fromCat === cat && styles.pillTextActive]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>To</Text>
        <View style={styles.pills}>
          {categories.filter((c) => c !== fromCat).map((cat) => (
            <Pressable
              key={cat}
              style={[styles.pill, toCat === cat && styles.pillActiveTo]}
              onPress={() => setToCat(cat)}
            >
              <Text style={[styles.pillText, toCat === cat && styles.pillTextActive]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor={Colors.gray400}
          keyboardType="numeric"
          value={displayAmount}
          onChangeText={(t) => setDisplayAmount(formatWithSeparator(t))}
        />

        <Pressable
          style={[styles.button, relocate.isPending && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={relocate.isPending}
        >
          <Text style={styles.buttonText}>
            {relocate.isPending ? "Moving..." : "Relocate"}
          </Text>
        </Pressable>

        {relocate.isError && (
          <Text style={styles.error}>
            {(relocate.error as any)?.response?.data?.detail ?? "Error"}
          </Text>
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
  pillActiveFrom: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orange,
  },
  pillActiveTo: {
    backgroundColor: Colors.purple,
    borderColor: Colors.purple,
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
  button: {
    backgroundColor: Colors.purple,
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
  error: {
    color: Colors.red,
    fontSize: 13,
  },
});
