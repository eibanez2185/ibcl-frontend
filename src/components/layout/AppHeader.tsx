import { useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { useNavigate } from "@tanstack/react-router";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTheme } from "@/theme";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { AppMenu } from "./AppMenu";

export function AppHeader() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useCurrentUser();
  const theme = useTheme();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const currentUser = data;

  return (
    <header className="border-b border-border bg-card">
      <div className="flex min-h-16 items-center justify-between px-6">
        <div className="flex items-center">
          <img
            src={theme.logo}
            alt={theme.nombre}
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            {isLoading ? (
              <div className="flex items-center justify-end gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Cargando usuario...
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-foreground">
                  {currentUser?.nombre}
                </p>

                <p className="text-xs text-muted-foreground">
                  {currentUser?.nombreEmpresa}
                </p>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutDialog(true)}
            className="cursor-pointer rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <AppMenu />

      <ConfirmDialog
        open={showLogoutDialog}
        title="¿Cerrar sesión?"
        message="¿Estás seguro de que deseas cerrar tu sesión?"
        confirmText="SI"
        cancelText="NO"
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={() => {
          logout();
          navigate({ to: "/login" });
        }}
      />
    </header>
  );
}
