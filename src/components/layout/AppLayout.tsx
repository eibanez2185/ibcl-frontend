import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/auth/AuthProvider";
import { SessionExpiredScreen } from "@/components/common/SessionExpiredScreen";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isSessionInvalid, resetSessionInvalid } = useAuth();
  const navigate = useNavigate();

  if (isSessionInvalid) {
    return (
      <SessionExpiredScreen
        onReturnToLogin={() => {
          resetSessionInvalid();
          void navigate({ to: "/login" });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isAuthenticated && <AppHeader />}

      {children}
    </div>
  );
}
