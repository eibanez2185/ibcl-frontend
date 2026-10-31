import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMiJornadaHoy } from "@/hooks/useMiJornadaHoy";
import { useInsertRegistro } from "@/hooks/useInsertRegistro";
import { useInsertSolicitud } from "@/hooks/useInsertSolicitud";
import { Dialog } from "@/components/common/Dialog";

import { authStorage } from "@/services/auth/authStorage";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const auth = authStorage.get();

    if (!auth) {
      throw redirect({
        to: "/login",
      });
    }
  },

  component: HomePage,
});

function HomePage() {
  const [registroSeleccionado, setRegistroSeleccionado] = useState<
    number | null
  >(null);

  const [horaSolicitada, setHoraSolicitada] = useState("");
  const [motivo, setMotivo] = useState("");
  const [solicitudRegistrada, setSolicitudRegistrada] = useState(false);

  const { data, isLoading, isError, refetch } = useMiJornadaHoy();
  const insertRegistroMutation = useInsertRegistro();
  const insertSolicitudMutation = useInsertSolicitud();

  const registroActual = data?.registros.find(
    (registro) => registro.id === registroSeleccionado,
  );

  const formatHora = (fechaHora: string) => {
    return new Intl.DateTimeFormat("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(fechaHora));
  };

  const crearFechaUtc = (hora: string) => {
    const [horas, minutos] = hora.split(":").map(Number);

    const fecha = new Date();

    fecha.setHours(horas, minutos, 0, 0);

    return fecha.toISOString();
  };

  return (
    <main className="px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Mi Jornada</h1>

          <p className="mt-2 text-base text-muted-foreground">
            Registra y consulta el estado de tu jornada laboral.
          </p>
        </div>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">
            Jornada de hoy
          </h2>

          <p className="mt-2 text-base text-muted-foreground">
            Aquí podrás consultar y registrar los movimientos de tu jornada.
          </p>

          <div className="mt-6 rounded-xl border border-border bg-background p-5">
            <p className="text-base text-muted-foreground">
              Estado de la jornada
            </p>

            <p className="mt-1 text-2xl font-semibold text-foreground">
              {isLoading
                ? "Consultando jornada..."
                : isError
                  ? "No fue posible consultar la jornada."
                  : (data?.estado?.replace(/_/g, " ") ?? "Sin información")}
            </p>

            {!isLoading && !isError && data && (
              <div className="mt-4 space-y-2">
                <p className="text-base text-muted-foreground">
                  Siguiente acción
                </p>

                <p className="text-lg font-medium text-foreground">
                  {data.siguienteAccion?.replace(/([a-z])([A-Z])/g, "$1 $2") ??
                    "Sin siguiente acción"}
                </p>

                <button
                  type="button"
                  disabled={
                    !data.puedeRegistrar ||
                    data.siguienteAccionId === null ||
                    insertRegistroMutation.isPending
                  }
                  onClick={() => {
                    if (data.siguienteAccionId === null) {
                      return;
                    }

                    insertRegistroMutation.mutate(data.siguienteAccionId, {
                      onSuccess: async () => {
                        await refetch();
                      },
                    });
                  }}
                  className="mt-4 w-fit cursor-pointer rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {insertRegistroMutation.isPending
                    ? "Registrando..."
                    : `Registrar ${
                        data.siguienteAccion?.replace(
                          /([a-z])([A-Z])/g,
                          "$1 $2",
                        ) ?? "Sin siguiente acción"
                      }`}
                </button>
              </div>
            )}
          </div>
        </section>

        {!isLoading && !isError && data && (
          <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-foreground">
                Registros de hoy
              </h2>

              <p className="mt-1 text-base text-muted-foreground">
                Consulta los movimientos registrados durante tu jornada.
              </p>
            </div>

            {data.registros.length === 0 ? (
              <div className="rounded-xl border border-border bg-background p-5 text-center">
                <p className="text-base text-muted-foreground">
                  Aún no tienes registros de jornada hoy.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="divide-y divide-border">
                  {data.registros.map((registro) => (
                    <div
                      key={registro.id}
                      className="flex flex-col gap-4 bg-background px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {registro.tipoRegistroNombre.replace(/_/g, " ")}
                        </p>

                        {registro.tipoRegistroDescripcion && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {registro.tipoRegistroDescripcion}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <p className="text-lg font-semibold text-foreground">
                          {formatHora(registro.fechaHora)}
                        </p>

                        <button
                          type="button"
                          disabled={registro.solicitudPendiente}
                          onClick={() => setRegistroSeleccionado(registro.id)}
                          className="cursor-pointer rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {registro.solicitudPendiente
                            ? "Solicitud pendiente"
                            : "Solicitar modificación"}
                        </button>

                        {registroSeleccionado === registro.id && (
                          <div className="mt-4 rounded-xl border border-border bg-card p-4">
                            <p className="font-medium text-foreground">
                              Solicitar modificación
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              Indica la nueva hora y el motivo de la
                              modificación.
                            </p>

                            <div className="mt-4">
                              <label className="text-sm font-medium text-foreground">
                                Nueva hora
                              </label>

                              <input
                                type="time"
                                value={horaSolicitada}
                                onChange={(event) =>
                                  setHoraSolicitada(event.target.value)
                                }
                                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                              />
                            </div>

                            <div className="mt-4">
                              <label className="text-sm font-medium text-foreground">
                                Motivo
                              </label>

                              <textarea
                                rows={3}
                                value={motivo}
                                onChange={(event) =>
                                  setMotivo(event.target.value)
                                }
                                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                placeholder="Explica el motivo de la modificación"
                              />
                            </div>

                            <div className="mt-4 flex gap-2">
                              <button
                                type="button"
                                disabled={
                                  !registroActual ||
                                  !horaSolicitada ||
                                  !motivo.trim() ||
                                  insertSolicitudMutation.isPending
                                }
                                onClick={() => {
                                  if (!registroActual) {
                                    return;
                                  }

                                  insertSolicitudMutation.mutate(
                                    {
                                      registroId: registroActual.id,
                                      idTipoRegistro:
                                        registroActual.tipoRegistroId,
                                      horaActual: new Date(
                                        registroActual.fechaHora,
                                      ).toISOString(),
                                      horaSolicitada:
                                        crearFechaUtc(horaSolicitada),
                                      motivo: motivo.trim(),
                                    },
                                    {
                                      onSuccess: async () => {
                                        setRegistroSeleccionado(null);
                                        setHoraSolicitada("");
                                        setMotivo("");
                                        setSolicitudRegistrada(true);

                                        await refetch();
                                      },
                                    },
                                  );
                                }}
                                className="cursor-pointer rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {insertSolicitudMutation.isPending
                                  ? "Enviando..."
                                  : "Enviar solicitud"}
                              </button>

                              <button
                                type="button"
                                onClick={() => setRegistroSeleccionado(null)}
                                className="cursor-pointer rounded-lg border border-border px-4 py-2 font-medium text-foreground"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <Dialog
        open={solicitudRegistrada}
        title="Solicitud registrada"
        onClose={() => setSolicitudRegistrada(false)}
      >
        <div className="space-y-4">
          <p className="text-base text-foreground">
            Tu solicitud fue registrada correctamente y quedó pendiente de
            gestión por parte del administrador.
          </p>

          <p className="text-sm text-muted-foreground">
            Por favor, espera la revisión y gestión correspondiente.
          </p>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSolicitudRegistrada(false)}
              className="cursor-pointer rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Entendido
            </button>
          </div>
        </div>
      </Dialog>
    </main>
  );
}
