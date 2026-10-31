import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { authStorage } from "@/services/auth/authStorage";
import { useMisJornadas } from "@/hooks/useMisJornadas";
import { useInsertSolicitud } from "@/hooks/useInsertSolicitud";
import type { MisJornada, RegistroJornadaDetalle } from "@/types/jornada";
import { useTipoRegistros } from "@/hooks/useTipoRegistros";
import { ApiError } from "@/services/api/apiClient";
import { Dialog } from "@/components/common/Dialog";

export const Route = createFileRoute("/mis-jornadas/")({
  beforeLoad: () => {
    const auth = authStorage.get();

    if (!auth) {
      throw redirect({
        to: "/login",
      });
    }
  },

  component: MisJornadasPage,
});

function MisJornadasPage() {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [errorSolicitud, setErrorSolicitud] = useState<string | null>(null);
  const [mensajeSolicitud, setMensajeSolicitud] = useState<string | null>(null);

  const [fechaDesdeConsultada, setFechaDesdeConsultada] = useState("");
  const [fechaHastaConsultada, setFechaHastaConsultada] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(
    null,
  );

  const [pagina, setPagina] = useState(1);
  const pageSize = 10;

  const [registroSeleccionado, setRegistroSeleccionado] = useState<
    number | null
  >(null);

  const [jornadaSeleccionada, setJornadaSeleccionada] =
    useState<MisJornada | null>(null);
  const [tipoRegistroNuevo, setTipoRegistroNuevo] = useState<number | null>(
    null,
  );

  const [horaSolicitada, setHoraSolicitada] = useState("");
  const [motivo, setMotivo] = useState("");

  const [solicitudRegistrada, setSolicitudRegistrada] = useState(false);

  const insertSolicitudMutation = useInsertSolicitud();
  const { data: tiposRegistro } = useTipoRegistros();

  const { data, isLoading, error, refetch } = useMisJornadas(
    fechaDesdeConsultada,
    fechaHastaConsultada,
    pagina,
    pageSize,
  );

  const consultar = () => {
    if (!fechaDesde || !fechaHasta) {
      return;
    }

    if (fechaDesde > fechaHasta) {
      return;
    }

    setPagina(1);

    setFechaDesdeConsultada(`${fechaDesde}T00:00:00-05:00`);
    setFechaHastaConsultada(`${fechaHasta}T00:00:00-05:00`);
  };

  if (error) {
    return (
      <main className="px-4 py-8 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-destructive">{error.message}</p>
        </div>
      </main>
    );
  }

  const enviarSolicitud = (registro: RegistroJornadaDetalle) => {
    if (!horaSolicitada || !motivo.trim()) {
      return;
    }

    setErrorSolicitud(null);

    const fechaRegistro = new Date(registro.fechaHora);
    const [horas, minutos] = horaSolicitada.split(":").map(Number);

    fechaRegistro.setHours(horas, minutos, 0, 0);

    insertSolicitudMutation.mutate(
      {
        registroId: registro.id,
        idTipoRegistro: registro.tipoRegistroId,
        horaActual: new Date(registro.fechaHora).toISOString(),
        horaSolicitada: fechaRegistro.toISOString(),
        motivo: motivo.trim(),
      },
      {
        onSuccess: async () => {
          setMensajeSolicitud("La solicitud fue enviada correctamente.");
          setTimeout(() => {
            setMensajeSolicitud(null);
          }, 4000);

          setRegistroSeleccionado(null);
          setHoraSolicitada("");
          setMotivo("");
          setSolicitudRegistrada(true);

          await refetch();
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            const data = error.data as {
              message?: string;
            };

            setErrorSolicitud(
              data.message ?? "No se pudo enviar la solicitud.",
            );
            return;
          }

          setErrorSolicitud("No se pudo enviar la solicitud.");
        },
      },
    );
  };

  const enviarSolicitudNuevoRegistro = (jornada: MisJornada) => {
    if (!tipoRegistroNuevo || !horaSolicitada || !motivo.trim()) {
      return;
    }

    setErrorSolicitud(null);

    const [horas, minutos] = horaSolicitada.split(":").map(Number);

    const fechaSolicitada = new Date(jornada.fecha);

    fechaSolicitada.setHours(horas, minutos, 0, 0);

    insertSolicitudMutation.mutate(
      {
        registroId: null,
        idTipoRegistro: tipoRegistroNuevo,
        horaActual: null,
        horaSolicitada: fechaSolicitada.toISOString(),
        motivo: motivo.trim(),
      },
      {
        onSuccess: async () => {
          setMensajeSolicitud("La solicitud fue enviada correctamente.");
          setTimeout(() => {
            setMensajeSolicitud(null);
          }, 8000);

          setJornadaSeleccionada(null);
          setTipoRegistroNuevo(null);
          setHoraSolicitada("");
          setMotivo("");
          setSolicitudRegistrada(true);

          await refetch();
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            const data = error.data as {
              message?: string;
            };

            setErrorSolicitud(
              data.message ?? "No se pudo enviar la solicitud.",
            );
            return;
          }

          setErrorSolicitud("No se pudo enviar la solicitud.");
        },
      },
    );
  };

  return (
    <main className="px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-2xl font-semibold text-foreground">
          Consultar mis jornadas
        </h1>

        {mensajeSolicitud && (
          <div className="mt-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {mensajeSolicitud}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div>
            <label
              htmlFor="fechaDesde"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Fecha desde
            </label>

            <input
              id="fechaDesde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          <div>
            <label
              htmlFor="fechaHasta"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Fecha hasta
            </label>

            <input
              id="fechaHasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          <button
            type="button"
            onClick={consultar}
            disabled={
              isLoading || !fechaDesde || !fechaHasta || fechaDesde > fechaHasta
            }
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Consultando..." : "Consultar"}
          </button>
        </div>

        {isLoading && (
          <div className="mt-6 rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">
              Consultando jornadas...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-destructive/50 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!isLoading && !error && data && data.items.length === 0 && (
          <div className="mt-6 rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">
              No se encontraron jornadas para el rango seleccionado.
            </p>
          </div>
        )}

        {!isLoading && !error && data && data.items.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-lg border border-border">
            {data.items.map((jornada) => {
              const estaSeleccionada = jornada.fecha === fechaSeleccionada;

              return (
                <div
                  key={jornada.fecha}
                  className="border-b border-border last:border-b-0"
                >
                  {/* Fila de la jornada */}
                  <button
                    type="button"
                    onClick={() =>
                      setFechaSeleccionada(
                        estaSeleccionada ? null : jornada.fecha,
                      )
                    }
                    className="block w-full cursor-pointer px-4 py-4 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex w-32 shrink-0 items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {estaSeleccionada ? "⌄" : "›"}
                        </span>

                        <span className="font-semibold text-foreground">
                          {new Date(jornada.fecha).toLocaleDateString("es-CO")}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {jornada.registros.map((registro) => (
                          <div
                            key={registro.id}
                            className="rounded-md bg-muted px-3 py-2"
                          >
                            <span className="text-sm font-medium text-foreground">
                              {registro.tipoRegistroNombre}
                            </span>

                            <span className="ml-2 text-sm text-muted-foreground">
                              {new Date(registro.fechaHora).toLocaleTimeString(
                                "es-CO",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </button>

                  {/* Detalle expandido */}
                  {estaSeleccionada && (
                    <div className="mx-4 mb-4 ml-10 rounded-lg border border-border bg-background p-4">
                      <h2 className="text-lg font-semibold text-foreground">
                        Jornada del{" "}
                        {new Date(jornada.fecha).toLocaleDateString("es-CO")}
                      </h2>

                      <div className="mt-4 space-y-2">
                        {jornada.registros.map((registro) => (
                          <div
                            key={registro.id}
                            className="flex w-full items-center justify-between rounded-md bg-muted px-3 py-3"
                          >
                            <div>
                              <span className="text-sm font-medium text-foreground">
                                {registro.tipoRegistroNombre}
                              </span>

                              <span className="ml-2 text-sm text-muted-foreground">
                                {new Date(
                                  registro.fechaHora,
                                ).toLocaleTimeString("es-CO", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setRegistroSeleccionado(registro.id);
                                setHoraSolicitada("");
                                setMotivo("");
                              }}
                              disabled={registro.solicitudPendiente}
                              className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {registro.solicitudPendiente
                                ? "Solicitud pendiente"
                                : "Solicitar modificación"}
                            </button>

                            {registroSeleccionado === registro.id && (
                              <div className="mt-4 rounded-lg border border-border bg-background p-4">
                                <p className="font-medium text-foreground">
                                  Solicitar modificación
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                  Indica la nueva hora y el motivo de la
                                  modificación.
                                </p>

                                <div className="mt-4">
                                  <label
                                    htmlFor={`hora-${registro.id}`}
                                    className="text-sm font-medium text-foreground"
                                  >
                                    Nueva hora
                                  </label>

                                  <input
                                    id={`hora-${registro.id}`}
                                    type="time"
                                    value={horaSolicitada}
                                    onChange={(event) =>
                                      setHoraSolicitada(event.target.value)
                                    }
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                  />
                                </div>

                                <div className="mt-4">
                                  <label
                                    htmlFor={`motivo-${registro.id}`}
                                    className="text-sm font-medium text-foreground"
                                  >
                                    Motivo
                                  </label>

                                  <textarea
                                    id={`motivo-${registro.id}`}
                                    rows={3}
                                    value={motivo}
                                    onChange={(event) =>
                                      setMotivo(event.target.value)
                                    }
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                    placeholder="Explica el motivo de la modificación"
                                  />
                                </div>

                                {errorSolicitud && (
                                  <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                    {errorSolicitud}
                                  </div>
                                )}

                                <div className="mt-4 flex gap-2">
                                  <button
                                    type="button"
                                    disabled={
                                      insertSolicitudMutation.isPending ||
                                      !horaSolicitada ||
                                      !motivo.trim()
                                    }
                                    onClick={() => enviarSolicitud(registro)}
                                    className="cursor-pointer rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {insertSolicitudMutation.isPending
                                      ? "Enviando..."
                                      : "Enviar solicitud"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRegistroSeleccionado(null);
                                      setHoraSolicitada("");
                                      setMotivo("");
                                      setErrorSolicitud(null);
                                    }}
                                    className="cursor-pointer rounded-lg border border-border px-4 py-2 font-medium text-foreground"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {new Date(jornada.fecha).setHours(0, 0, 0, 0) <
                          new Date().setHours(0, 0, 0, 0) &&
                          jornada.estado !== "FINALIZADA" && (
                            <div className="mt-4 flex justify-end border-t border-border pt-4">
                              <button
                                type="button"
                                onClick={() => setJornadaSeleccionada(jornada)}
                                className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                              >
                                Adicionar registro
                              </button>
                            </div>
                          )}

                        {jornadaSeleccionada?.fecha === jornada.fecha && (
                          <div className="mt-4 rounded-lg border border-border bg-background p-4">
                            <p className="font-medium text-foreground">
                              Solicitar nuevo registro
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              Indica el tipo de registro, la hora y el motivo de
                              la solicitud.
                            </p>

                            <div className="mt-4">
                              <label
                                htmlFor={`tipo-registro-${jornada.fecha}`}
                                className="text-sm font-medium text-foreground"
                              >
                                Tipo de registro
                              </label>

                              <select
                                id={`tipo-registro-${jornada.fecha}`}
                                value={tipoRegistroNuevo ?? ""}
                                onChange={(event) =>
                                  setTipoRegistroNuevo(
                                    event.target.value
                                      ? Number(event.target.value)
                                      : null,
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                              >
                                <option value="">
                                  Selecciona un tipo de registro
                                </option>

                                {tiposRegistro
                                  ?.filter(
                                    (tipo) =>
                                      !jornada.registros.some(
                                        (registro) =>
                                          registro.tipoRegistroId === tipo.id,
                                      ),
                                  )
                                  .map((tipo) => (
                                    <option key={tipo.id} value={tipo.id}>
                                      {tipo.nombre}
                                    </option>
                                  ))}
                              </select>
                              <div className="mt-4">
                                <label
                                  htmlFor={`hora-nuevo-${jornada.fecha}`}
                                  className="text-sm font-medium text-foreground"
                                >
                                  Hora
                                </label>

                                <input
                                  id={`hora-nuevo-${jornada.fecha}`}
                                  type="time"
                                  value={horaSolicitada}
                                  onChange={(event) =>
                                    setHoraSolicitada(event.target.value)
                                  }
                                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                />
                              </div>
                              <div className="mt-4">
                                <label
                                  htmlFor={`motivo-nuevo-${jornada.fecha}`}
                                  className="text-sm font-medium text-foreground"
                                >
                                  Motivo
                                </label>

                                <textarea
                                  id={`motivo-nuevo-${jornada.fecha}`}
                                  rows={3}
                                  value={motivo}
                                  onChange={(event) =>
                                    setMotivo(event.target.value)
                                  }
                                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                  placeholder="Explica el motivo de la solicitud"
                                />
                              </div>

                              {errorSolicitud && (
                                <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                  {errorSolicitud}
                                </div>
                              )}

                              <div className="mt-4 flex gap-2">
                                <button
                                  type="button"
                                  disabled={
                                    insertSolicitudMutation.isPending ||
                                    !tipoRegistroNuevo ||
                                    !horaSolicitada ||
                                    !motivo.trim()
                                  }
                                  onClick={() =>
                                    enviarSolicitudNuevoRegistro(jornada)
                                  }
                                  className="cursor-pointer rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {insertSolicitudMutation.isPending
                                    ? "Enviando..."
                                    : "Enviar solicitud"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setJornadaSeleccionada(null);
                                    setTipoRegistroNuevo(null);
                                    setHoraSolicitada("");
                                    setMotivo("");
                                    setErrorSolicitud(null);
                                  }}
                                  className="cursor-pointer rounded-lg border border-border px-4 py-2 font-medium text-foreground"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {!isLoading && !error && data.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <button
                  type="button"
                  onClick={() => setPagina(1)}
                  disabled={pagina <= 1}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Primera
                </button>

                <button
                  type="button"
                  onClick={() => setPagina((paginaActual) => paginaActual - 1)}
                  disabled={pagina <= 1}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>

                <span className="text-sm text-muted-foreground">
                  Página {data.page} de {data.totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setPagina((paginaActual) => paginaActual + 1)}
                  disabled={pagina >= data.totalPages}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>

                <button
                  type="button"
                  onClick={() => setPagina(data.totalPages)}
                  disabled={pagina >= data.totalPages}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Última
                </button>
              </div>
            )}
          </div>
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
