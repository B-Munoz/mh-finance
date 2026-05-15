import axios from "axios";

const client = axios.create({ baseURL: "/api/v1" });

client.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("mh_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("mh_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default client;
