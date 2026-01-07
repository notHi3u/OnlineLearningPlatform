import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "teacher" | "admin";
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  setName: (name: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,

      setAuth: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken,
        }),

      setName: (name) =>
        set((state) => ({
          user: state.user ? { ...state.user, name } : null,
        })),

      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);
