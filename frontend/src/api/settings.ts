import client from "./client";
import type { UserSettings } from "../types";

export const getSettings = async (): Promise<UserSettings> => {
  const { data } = await client.get<UserSettings>("/settings");
  return data;
};

export const saveSettings = async (payload: Partial<UserSettings>): Promise<void> => {
  await client.put("/settings", payload);
};
