import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { authStorage } from "@/services/auth/authStorage";
import { useState } from "react";
import { LoginCard } from "@/components/common/LoginCard";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useLogin } from "@/hooks/useLogin";

export const Route = createFileRoute("/login/")({
  beforeLoad: () => {
    const auth = authStorage.get();

    if (auth) {
      throw redirect({
        to: "/",
      });
    }
  },

  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [idEmpresa, setIdEmpresa] = useState("");
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState<{
    idEmpresa?: string;
    email?: string;
    general?: string;
  }>({});

  const { data, isLoading, isError } = useEmpresas();
  const loginMutation = useLogin();

  const validationErrors = loginMutation.error?.validationErrors ?? [];

  const empresaError = validationErrors.find(
    (error) => error.propertyName === "IdEmpresa",
  )?.errorMessage;

  const emailError = validationErrors.find(
    (error) => error.propertyName === "Email",
  )?.errorMessage;

  const empresas = [...(data?.data ?? [])].sort((a, b) =>
    a.nombre.localeCompare(b.nombre),
  );

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newErrors: {
      idEmpresa?: string;
      email?: string;
      general?: string;
    } = {};

    if (!idEmpresa) {
      newErrors.idEmpresa = "Seleccione una empresa";
    }

    if (!email.trim()) {
      newErrors.email = "Ingrese su correo electrónico";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Ingrese un correo electrónico válido";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    loginMutation.mutate(
      {
        idEmpresa: Number(idEmpresa),
        email,
      },
      {
        onSuccess: () => {
          navigate({
            to: "/",
          });
        },
      },
    );
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <LoginCard>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">
              Iniciar sesión
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Ingresa tus datos para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="empresa"
                className="text-sm font-medium text-foreground"
              >
                Empresa
              </label>

              <select
                id="empresa"
                value={idEmpresa}
                onChange={(event) => setIdEmpresa(event.target.value)}
                disabled={isLoading || isError}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {isLoading
                    ? "Cargando empresas..."
                    : "Seleccione una empresa"}
                </option>

                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
              {(errors.idEmpresa || empresaError) && (
                <p className="text-sm text-destructive">
                  {errors.idEmpresa || empresaError}
                </p>
              )}

              {isError && (
                <p className="text-sm text-destructive">
                  No fue posible cargar las empresas.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Correo electrónico
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@empresa.com"
                autoComplete="email"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
              />
              {(errors.email || emailError) && (
                <p className="text-sm text-destructive">
                  {errors.email || emailError}
                </p>
              )}
            </div>
            {loginMutation.isError && (
              <p className="text-sm text-destructive text-center">
                {loginMutation.error.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || isError || loginMutation.isPending}
              className="w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Iniciando sesión...
                </span>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>
        </div>
      </LoginCard>
    </main>
  );
}
