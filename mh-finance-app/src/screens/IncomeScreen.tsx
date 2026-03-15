import React, { useRef } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, Pressable, Text } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useIncomes } from "../hooks/useIncomes";
import { useBudgets } from "../hooks/useBudgets";
import { IncomeHistory } from "../components/dashboard/IncomeHistory";
import { IncomeSheet } from "../components/forms/IncomeSheet";
import { RelocateSheet } from "../components/forms/RelocateSheet";
import { Colors } from "../utils/colors";

export function IncomeScreen() {
  const { refetch: refetchIncomes } = useIncomes();
  const { refetch: refetchBudgets } = useBudgets();
  const incomeSheetRef = useRef<BottomSheet>(null);
  const relocateSheetRef = useRef<BottomSheet>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refetchIncomes(), refetchBudgets()]);
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <IncomeHistory />
      </ScrollView>

      <View style={styles.fabRow}>
        <Pressable
          style={[styles.fab, { backgroundColor: Colors.green }]}
          onPress={() => incomeSheetRef.current?.expand()}
        >
          <Ionicons name="wallet-outline" size={20} color={Colors.white} />
          <Text style={styles.fabLabel}>Add Income</Text>
        </Pressable>
        <Pressable
          style={[styles.fab, { backgroundColor: Colors.purple }]}
          onPress={() => relocateSheetRef.current?.expand()}
        >
          <Ionicons name="swap-horizontal-outline" size={20} color={Colors.white} />
          <Text style={styles.fabLabel}>Relocate</Text>
        </Pressable>
      </View>

      <IncomeSheet bottomSheetRef={incomeSheetRef} />
      <RelocateSheet bottomSheetRef={relocateSheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  fabRow: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabLabel: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
});
