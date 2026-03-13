import client from "./client";
import type { UserSettings } from "../types";

export const getSettings = async (): Promise<UserSettings> => {
  const { data } = await client.get<UserSettings>("/settings");
  return data;
};

export const saveSettings = async (payload: Partial<UserSettings>): Promise<void> => {
  await client.put("/settings", payload);
};

export const addCategory = async (name: string): Promise<void> => {
  await client.post("/settings/categories", { name });
};

export const deleteCategory = async (name: string): Promise<void> => {
  await client.delete(`/settings/categories/${encodeURIComponent(name)}`);
};

export const renameCategory = async (oldName: string, newName: string): Promise<void> => {
  await client.put(`/settings/categories/${encodeURIComponent(oldName)}`, { new_name: newName });
};
