import axios from "axios";
import { clearAuth, getAuth } from "../auth/auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8081",
});

api.interceptors.request.use((config) => {
  const auth = getAuth();
  if (auth?.token) {
    if (!config.headers) config.headers = {};
    // Axios v1 may use AxiosHeaders internally; support both shapes.
    const anyHeaders: any = config.headers as any;
    if (typeof anyHeaders.set === "function") {
      anyHeaders.set("Authorization", `Bearer ${auth.token}`);
    } else {
      anyHeaders.Authorization = `Bearer ${auth.token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      clearAuth();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);
