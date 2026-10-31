import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { LoginResponse } from "@/types/auth";
import { SESSION_INVALID_EVENT } from "@/services/api/apiClient";
import { authStorage } from "@/services/auth/authStorage";

interface AuthContextValue {
  auth: LoginResponse | null;
  isAuthenticated: boolean;
  isSessionInvalid: boolean;
  setAuth: (auth: LoginResponse) => void;
  logout: () => void;
  resetSessionInvalid: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [auth, setAuthState] = useState<LoginResponse | null>(() =>
    authStorage.get(),
  );
  const [isSessionInvalid, setIsSessionInvalid] = useState(false);
  const hasHandledSessionInvalidRef = useRef(false);

  useEffect(() => {
    const handleSessionInvalid = () => {
      if (hasHandledSessionInvalidRef.current) {
        return;
      }

      hasHandledSessionInvalidRef.current = true;
      authStorage.clear();
      setAuthState(null);
      setIsSessionInvalid(true);
    };

    window.addEventListener(SESSION_INVALID_EVENT, handleSessionInvalid);

    return () => {
      window.removeEventListener(SESSION_INVALID_EVENT, handleSessionInvalid);
    };
  }, []);

  const setAuth = (newAuth: LoginResponse) => {
    authStorage.save(newAuth);
    setAuthState(newAuth);
  };

  const logout = () => {
    authStorage.clear();
    setAuthState(null);
  };

  const resetSessionInvalid = () => {
    hasHandledSessionInvalidRef.current = false;
    setIsSessionInvalid(false);
  };

  const isAuthenticated = auth !== null;

  return (
    <AuthContext.Provider
      value={{
        auth,
        isAuthenticated,
        isSessionInvalid,
        setAuth,
        logout,
        resetSessionInvalid,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
  }

  return context;
}
