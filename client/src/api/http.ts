// client/src/api/http.ts
import axios from "axios";
import { useAuth } from "../store/auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Request interceptor: thêm token
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

// Response interceptor: xử lý token hết hạn
let isRefreshing = false;
let failedRequestsQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedRequestsQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedRequestsQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const message = error.response?.data?.message;

      // Nếu là "Token expired" và chưa đang refresh
      if (message === "Token expired" && !isRefreshing) {
        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = useAuth.getState().refreshToken;

        if (!refreshToken) {
          // Không có refresh token, logout
          useAuth.getState().logout();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        return new Promise((resolve, reject) => {
          api
            .post("/auth/refresh-token", { refreshToken })
            .then((res) => {
              const { accessToken, refreshToken: newRefreshToken } = res.data;
              
              // Cập nhật auth store
              const auth = useAuth.getState();
              if (auth.user) {
                useAuth.getState().setAuth(auth.user, accessToken, newRefreshToken);
              }

              // Cập nhật header cho request gốc
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              
              // Xử lý queue và thử lại request
              processQueue(null, accessToken);
              resolve(api(originalRequest));
            })
            .catch((err) => {
              // Refresh thất bại, logout
              processQueue(err);
              useAuth.getState().logout();
              window.location.href = "/login";
              reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      }

      // Các lỗi 401 khác (token không hợp lệ, không có token)
      useAuth.getState().logout();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Logout helper - gọi API để xóa refresh token ở server
export const logout = async () => {
  const refreshToken = useAuth.getState().refreshToken;
  try {
    await api.post("/auth/logout", { refreshToken });
  } catch {
    // Ignore errors
  }
  useAuth.getState().logout();
  window.location.href = "/login";
};
