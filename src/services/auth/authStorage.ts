import type { LoginResponse } from "@/types/auth";

const AUTH_STORAGE_KEY = "jornadas_auth";

export const authStorage = {
  save(auth: LoginResponse): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  },

  get(): LoginResponse | null {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedAuth) {
      return null;
    }

    try {
      return JSON.parse(storedAuth) as LoginResponse;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  },

  clear(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },
};