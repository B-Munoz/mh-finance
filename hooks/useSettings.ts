"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, saveSettings, addCategory, deleteCategory, renameCategory } from "@/api/settings";
import type { UserSettings } from "@/types";

const INVALIDATE_KEYS = [["settings"], ["config"], ["budgets"]];

function useInvalidateAll() {
  const qc = useQueryClient();
  return () => INVALIDATE_KEYS.forEach((key) => qc.invalidateQueries({ queryKey: key }));
}

export function useSettings() {
  return useQuery({ queryKey: ["settings"], queryFn: getSettings });
}

export function useSaveSettings() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: (payload: Partial<UserSettings>) => saveSettings(payload),
    onSuccess: invalidateAll,
  });
}

export function useAddCategory() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: (name: string) => addCategory(name),
    onSuccess: invalidateAll,
  });
}

export function useDeleteCategory() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: (name: string) => deleteCategory(name),
    onSuccess: invalidateAll,
  });
}

export function useRenameCategory() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: ({ oldName, newName }: { oldName: string; newName: string }) => renameCategory(oldName, newName),
    onSuccess: invalidateAll,
  });
}
