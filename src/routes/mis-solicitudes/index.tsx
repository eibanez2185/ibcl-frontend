import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { authStorage } from "@/services/auth/authStorage";
import { useMisSolicitudes } from "@/hooks/useMisSolicitudes";

export const Route = createFileRoute("/mis-solicitudes/")({
  beforeLoad: () => {
    const auth = authStorage.get();

    if (!auth) {
      throw redirect({
        to: "/login",
      });
    }
  },

  component: MisSolicitudesPage,
});

function MisSolicitudesPage() {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [fechaDesdeConsultada, setFechaDesdeConsultada] = useState("");
  const [fechaHastaConsultada, setFechaHastaConsultada] = useState("");

  const [pagina, setPagina] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");

  const pageSize = 10;

  const { data, isLoading, error } = useMisSolicitudes(
    fechaDesdeConsultada,
    fechaHastaConsultada,
    pagina,
    pageSize,
  );

  const solicitudesFiltradas =
    data?.items.filter((solicitud) => {
      if (estadoFiltro === "TODOS") {
        return true;
      }

      return solicitud.estado === estadoFiltro;
    }) ?? [];

  const estadosDisponibles = Array.from(
    new Set(data?.items.map((solicitud) => solicitud.estado) ?? []),
  );

  const consultar = () => {
    if (!fechaDesde || !fechaHasta) {
      return;
    }

    if (fechaDesde > fechaHasta) {
      return;
    }

    setPagina(1);
    setEstadoFiltro("TODOS");

    setFechaDesdeConsultada(`${fechaDesde}T00:00:00-05:00`);
    setFechaHastaConsultada(`${fechaHasta}T00:00:00-05:00`);
  };

  return (
    <main className="px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <h1 className="text-2xl font-semibold text-foreground">
          Mis Solicitudes
        </h1>

        <p className="mt-2 text-muted-foreground">
          Consulta las solicitudes realizadas en un rango de fechas.
        </p>

        <div className="mt-6 rounded-lg border border-border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
                onChange={(event) => setFechaDesde(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
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
                onChange={(event) => setFechaHasta(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={consultar}
              disabled={
                isLoading ||
                !fechaDesde ||
                !fechaHasta ||
                fechaDesde > fechaHasta
              }
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Consultando..." : "Consultar"}
            </button>
          </div>
        </div>

        {isLoading && (
          <p className="mt-6 text-sm text-muted-foreground">
            Consultando solicitudes...
          </p>
        )}

        {error && (
          <p className="mt-6 text-sm text-destructive">{error.message}</p>
        )}

        {data && (
          <div className="mt-6">
            <p className="mb-4 text-sm text-muted-foreground">
              Solicitudes encontradas: {data.total}
            </p>

            {solicitudesFiltradas.length === 0 ? (
              <div className="rounded-lg border border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No se encontraron solicitudes para el filtro seleccionado.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-muted">
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-medium text-foreground">
                        Id
                      </th>

                      <th className="px-4 py-3 text-left font-medium text-foreground">
                        Fecha solicitud
                      </th>

                      <th className="px-4 py-3 text-left font-medium text-foreground">
                        Tipo
                      </th>

                      <th className="px-4 py-3 text-left font-medium text-foreground">
                        Solicitud
                      </th>

                      <th className="px-4 py-3 text-left font-medium text-foreground">
                        Hora actual
                      </th>

                      <th className="px-4 py-3 text-left font-medium text-foreground">
                        Hora solicitada
                      </th>

                      <th className="px-4 py-3 text-left font-medium text-foreground">
                        Motivo
                      </th>

                      <th className="px-4 py-3 text-left font-medium text-foreground">
                        <select
                          value={estadoFiltro}
                          onChange={(event) =>
                            setEstadoFiltro(event.target.value)
                          }
                          className="rounded-md border border-border bg-background px-2 py-1 text-sm font-medium text-foreground outline-none focus:border-primary"
                        >
                          <option value="TODOS">TODOS</option>

                          {estadosDisponibles.map((estado) => (
                            <option key={estado} value={estado}>
                              {estado}
                            </option>
                          ))}
                        </select>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {solicitudesFiltradas.map((solicitud) => (
                      <tr
                        key={solicitud.id}
                        className="border-b border-border last:border-b-0 hover:bg-muted/50"
                      >
                        <td className="px-4 py-3 text-foreground">
                          {solicitud.id}
                        </td>

                        <td className="px-4 py-3 text-foreground">
                          {new Date(solicitud.fechaSolicitud).toLocaleString(
                            "es-CO",
                            {
                              hour12: true,
                            },
                          )}
                        </td>

                        <td className="px-4 py-3 text-foreground">
                          {solicitud.tipoRegistroNombre}
                        </td>

                        <td className="px-4 py-3 text-foreground">
                          {solicitud.registroId
                            ? "Modificación"
                            : "Nuevo registro"}
                        </td>

                        <td className="px-4 py-3 text-foreground">
                          {solicitud.horaActual
                            ? new Date(solicitud.horaActual).toLocaleString(
                                "es-CO",
                                {
                                  hour12: true,
                                },
                              )
                            : "—"}
                        </td>

                        <td className="px-4 py-3 text-foreground">
                          {solicitud.horaSolicitada
                            ? new Date(solicitud.horaSolicitada).toLocaleString(
                                "es-CO",
                                {
                                  hour12: true,
                                },
                              )
                            : "—"}
                        </td>

                        <td className="max-w-[250px] px-4 py-3 text-foreground">
                          <span
                            className="block truncate"
                            title={solicitud.motivo}
                          >
                            {solicitud.motivo}
                          </span>
                        </td>

                        <td className="px-4 py-3 font-medium text-foreground">
                          {solicitud.estado}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

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
    </main>
  );
}
