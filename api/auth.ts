import client from "./client";

export const loginUser = (username: string, password: string) =>
  client.post("/auth/login", { username, password }).then((r) => r.data);
