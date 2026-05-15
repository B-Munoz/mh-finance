import client from "./client";
import type { UserSettings } from "@/types";

export const getSettings = (): Promise<UserSettings> => client.get("/settings").then((r) => r.data);

export const saveSettings = (payload: Partial<UserSettings>): Promise<void> =>
  client.put("/settings", payload).then((r) => r.data);

export const addCategory = (name: string): Promise<void> =>
  client.post("/settings/categories", { name }).then((r) => r.data);

export const deleteCategory = (name: string): Promise<void> =>
  client.delete(`/settings/categories/${encodeURIComponent(name)}`).then((r) => r.data);

export const renameCategory = (oldName: string, newName: string): Promise<void> =>
  client.put(`/settings/categories/${encodeURIComponent(oldName)}`, { new_name: newName }).then((r) => r.data);
