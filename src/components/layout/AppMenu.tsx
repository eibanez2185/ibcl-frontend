import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { useNavigate } from "@tanstack/react-router";
import { useRouterState } from "@tanstack/react-router";

export function AppMenu() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [showAdministrationMenu, setShowAdministrationMenu] = useState(false);
  const administrationMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        administrationMenuRef.current &&
        !administrationMenuRef.current.contains(event.target as Node)
      ) {
        setShowAdministrationMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const esAdministrador = auth?.roles.some(
    (rol) => rol.nombre === "ADMINISTRADOR",
  );

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <nav className="border-t border-border">
      <div className="flex min-h-12 items-center gap-1 px-6">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/"
              ? "bg-muted text-foreground"
              : "text-foreground hover:bg-muted"
          }`}
        >
          Mi Jornada
        </button>

        <button
          type="button"
          onClick={() => navigate({ to: "/mis-jornadas" })}
          className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/mis-jornadas"
              ? "bg-muted text-foreground"
              : "text-foreground hover:bg-muted"
          }`}
        >
          Mis Jornadas
        </button>

        <button
          type="button"
          onClick={() => navigate({ to: "/mis-solicitudes" })}
          className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/mis-solicitudes"
              ? "bg-muted text-foreground"
              : "text-foreground hover:bg-muted"
          }`}
        >
          Mis Solicitudes
        </button>

        <button
          type="button"
          onClick={() => navigate({ to: "/mis-novedades" })}
          className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/mis-novedades"
              ? "bg-muted text-foreground"
              : "text-foreground hover:bg-muted"
          }`}
        >
          Mis Novedades
        </button>

        <button
          type="button"
          onClick={() => navigate({ to: "/mi-firma" })}
          className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/mi-firma"
              ? "bg-muted text-foreground"
              : "text-foreground hover:bg-muted"
          }`}
        >
          Mi firma
        </button>

        <button
          type="button"
          onClick={() => navigate({ to: "/reportes" })}
          className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/reportes"
              ? "bg-muted text-foreground"
              : "text-foreground hover:bg-muted"
          }`}
        >
          Reportes
        </button>

        {esAdministrador && (
          <div ref={administrationMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setShowAdministrationMenu((current) => !current)}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Administración ▾
            </button>

            {showAdministrationMenu && (
              <div className="absolute left-0 top-full z-10 mt-1 w-56 rounded-lg border border-border bg-card p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdministrationMenu(false);
                    navigate({ to: "/gestion-solicitudes" });
                  }}
                  className="block w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                >
                  Gestión de Solicitudes
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAdministrationMenu(false);
                    navigate({ to: "/gestion-novedades" });
                  }}
                  className="block w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                >
                  Gestión de Novedades
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
