import axios from "axios";

const client = axios.create({
  baseURL: "/api/v1",
});

client.interceptors.request.use((config) => {
  const params = new URLSearchParams(window.location.search);
  const user = params.get("user") ?? "neon";
  config.params = { ...config.params, user };
  return config;
});

export default client;
