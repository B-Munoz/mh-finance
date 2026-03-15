import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  SectionList,
  StyleSheet,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  useSettings,
  useSaveSettings,
  useAddCategory,
  useDeleteCategory,
  useRenameCategory,
} from "../hooks/useSettings";
import { useAuth } from "../contexts/AuthContext";
import { Colors } from "../utils/colors";

export function SettingsScreen() {
  const { username, logout } = useAuth();
  const { data: settings, isLoading, refetch } = useSettings();
  const save = useSaveSettings();
  const addCat = useAddCategory();
  const deleteCat = useDeleteCategory();
  const renameCat = useRenameCategory();

  const [allocPct, setAllocPct] = useState<Record<string, string>>({});
  const [limits, setLimits] = useState<Record<string, string>>({});
  const [renamingCat, setRenamingCat] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!settings) return;
    const pct: Record<string, string> = {};
    for (const [cat, val] of Object.entries(settings.allocation_pct)) {
      pct[cat] = String(Math.round(val * 100));
    }
    setAllocPct(pct);

    const lim: Record<string, string> = {};
    for (const [cat, val] of Object.entries(settings.category_limits)) {
      lim[cat] = String(val);
    }
    setLimits(lim);
  }, [settings]);

  if (isLoading || !settings) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading settings...</Text>
      </View>
    );
  }

  const categories = Object.keys(settings.allocation_pct);
  const totalPct = Object.values(allocPct).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const sumOk = totalPct <= 100 + 1e-6;

  function handleSave() {
    const allocation_pct: Record<string, number> = {};
    for (const [cat, v] of Object.entries(allocPct)) {
      allocation_pct[cat] = (parseFloat(v) || 0) / 100;
    }
    const category_limits: Record<string, number> = {};
    for (const [cat, v] of Object.entries(limits)) {
      category_limits[cat] = parseFloat(v) || 0;
    }
    save.mutate(
      { allocation_pct, category_limits },
      {
        onSuccess: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
      }
    );
  }

  function handleDeleteCategory(cat: string) {
    Alert.alert("Delete Category", `Delete "${cat}"? Requires zero balance.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteCat.mutate(cat, {
            onError: (e: any) => {
              Alert.alert("Error", e?.response?.data?.detail ?? "Error deleting category");
            },
          });
        },
      },
    ]);
  }

  function submitRename(cat: string) {
    const newName = renameValue.trim();
    if (!newName || newName === cat) {
      setRenamingCat(null);
      return;
    }
    renameCat.mutate(
      { oldName: cat, newName },
      {
        onSuccess: () => setRenamingCat(null),
        onError: (e: any) => {
          Alert.alert("Error", e?.response?.data?.detail ?? "Error renaming");
        },
      }
    );
  }

  function handleAddCategory() {
    const name = newCatName.trim();
    if (!name) return;
    addCat.mutate(name, {
      onSuccess: () => setNewCatName(""),
      onError: (e: any) => {
        Alert.alert("Error", e?.response?.data?.detail ?? "Error adding category");
      },
    });
  }

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  function handleLogout() {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => logout() },
    ]);
  }

  type SectionItem = { type: "category" | "alloc" | "limit"; cat: string };
  const sections: { title: string; data: SectionItem[] }[] = [
    {
      title: "Categories",
      data: categories.map((cat) => ({ type: "category", cat })),
    },
    {
      title: `Allocation % (Total: ${totalPct.toFixed(0)}%)`,
      data: categories.map((cat) => ({ type: "alloc", cat })),
    },
    {
      title: "Category Limits (0 = no limit)",
      data: categories.map((cat) => ({ type: "limit", cat })),
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SectionList
        sections={sections}
        keyExtractor={(item, i) => `${item.type}-${item.cat}-${i}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          if (item.type === "category") {
            return (
              <View style={styles.catRow}>
                {renamingCat === item.cat ? (
                  <View style={styles.renameRow}>
                    <TextInput
                      style={styles.renameInput}
                      value={renameValue}
                      onChangeText={setRenameValue}
                      autoFocus
                      onSubmitEditing={() => submitRename(item.cat)}
                    />
                    <Pressable onPress={() => submitRename(item.cat)}>
                      <Ionicons name="checkmark" size={20} color={Colors.green} />
                    </Pressable>
                    <Pressable onPress={() => setRenamingCat(null)}>
                      <Ionicons name="close" size={20} color={Colors.gray400} />
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.catContent}>
                    <Pressable
                      style={styles.catName}
                      onPress={() => {
                        setRenamingCat(item.cat);
                        setRenameValue(item.cat);
                      }}
                    >
                      <Text style={styles.catText}>{item.cat}</Text>
                    </Pressable>
                    <Pressable onPress={() => handleDeleteCategory(item.cat)}>
                      <Ionicons name="trash-outline" size={16} color={Colors.red} />
                    </Pressable>
                  </View>
                )}
              </View>
            );
          }

          if (item.type === "alloc") {
            return (
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>{item.cat}</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.numberInput}
                    keyboardType="numeric"
                    value={allocPct[item.cat] ?? ""}
                    onChangeText={(v) =>
                      setAllocPct((prev) => ({ ...prev, [item.cat]: v }))
                    }
                  />
                  <Text style={styles.suffix}>%</Text>
                </View>
              </View>
            );
          }

          // limit
          return (
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>{item.cat}</Text>
              <TextInput
                style={styles.numberInput}
                keyboardType="numeric"
                value={limits[item.cat] ?? ""}
                onChangeText={(v) =>
                  setLimits((prev) => ({ ...prev, [item.cat]: v }))
                }
              />
            </View>
          );
        }}
        renderSectionFooter={({ section }) => {
          if (section.title === "Categories") {
            return (
              <View style={styles.addCatRow}>
                <TextInput
                  style={styles.addCatInput}
                  placeholder="New category name"
                  placeholderTextColor={Colors.gray400}
                  value={newCatName}
                  onChangeText={setNewCatName}
                  onSubmitEditing={handleAddCategory}
                />
                <Pressable
                  style={[
                    styles.addCatBtn,
                    (!newCatName.trim() || addCat.isPending) && styles.disabled,
                  ]}
                  onPress={handleAddCategory}
                  disabled={!newCatName.trim() || addCat.isPending}
                >
                  <Text style={styles.addCatBtnText}>
                    {addCat.isPending ? "Adding..." : "Add"}
                  </Text>
                </Pressable>
              </View>
            );
          }
          return null;
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            <Pressable
              style={[
                styles.saveButton,
                (!sumOk || save.isPending) && styles.disabled,
              ]}
              onPress={handleSave}
              disabled={!sumOk || save.isPending}
            >
              <Text style={styles.saveButtonText}>
                {save.isPending ? "Saving..." : "Save Settings"}
              </Text>
            </Pressable>

            {save.isSuccess && (
              <Text style={styles.success}>Settings saved!</Text>
            )}
            {save.isError && (
              <Text style={styles.errorText}>
                {(save.error as any)?.response?.data?.detail ?? "Error saving settings"}
              </Text>
            )}

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color={Colors.red} />
              <Text style={styles.logoutText}>Sign Out ({username})</Text>
            </Pressable>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loading: {
    color: Colors.gray400,
    fontSize: 14,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.gray500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
  },
  catRow: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  catContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catName: {
    flex: 1,
  },
  catText: {
    fontSize: 14,
    color: Colors.gray700,
  },
  renameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  renameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: Colors.gray800,
  },
  settingRow: {
    backgroundColor: Colors.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  settingLabel: {
    fontSize: 14,
    color: Colors.gray700,
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: Colors.gray800,
    textAlign: "right",
    width: 80,
    backgroundColor: Colors.gray50,
  },
  suffix: {
    fontSize: 14,
    color: Colors.gray500,
  },
  addCatRow: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  addCatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.gray800,
  },
  addCatBtn: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  addCatBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    gap: 16,
    marginTop: 24,
  },
  saveButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
  success: {
    color: Colors.green,
    fontSize: 13,
  },
  errorText: {
    color: Colors.red,
    fontSize: 13,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutText: {
    color: Colors.red,
    fontSize: 14,
    fontWeight: "500",
  },
});
