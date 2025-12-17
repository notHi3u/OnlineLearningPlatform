// client/src/api/http.ts
import axios from "axios";
import { useAuth } from "../store/auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// 🔥 interceptor MUST be here
api.interceptors.request.use(
  (config) => {
    const token = useAuth.getState().token;

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
