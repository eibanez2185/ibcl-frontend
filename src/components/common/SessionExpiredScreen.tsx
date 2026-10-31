interface SessionExpiredScreenProps {
  onReturnToLogin: () => void;
}

export function SessionExpiredScreen({
  onReturnToLogin,
}: SessionExpiredScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section
        aria-labelledby="session-expired-title"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg"
        role="alert"
      >
        <h1
          className="text-2xl font-bold text-foreground"
          id="session-expired-title"
        >
          Tu sesión ha caducado o ya no es válida
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Para continuar usando IBCL Jornadas, vuelve a iniciar sesión.
        </p>

        <button
          className="mt-6 w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          onClick={onReturnToLogin}
          type="button"
        >
          Volver a iniciar sesión
        </button>
      </section>
    </main>
  );
}
