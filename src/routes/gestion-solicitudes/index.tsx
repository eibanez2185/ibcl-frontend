import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { authStorage } from "@/services/auth/authStorage";
import { useSolicitudesAdministrativas } from "@/hooks/useSolicitudesAdministrativas";
import { useUsuarios } from "@/hooks/useUsuarios";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { SolicitudAdministrativa } from "@/types/solicitud";
import { solicitudService } from "@/services/api/solicitudService";
import { ApiError } from "@/services/api/apiClient";

export const Route = createFileRoute("/gestion-solicitudes/")({
  beforeLoad: () => {
    const auth = authStorage.get();

    if (!auth) {
      throw redirect({
        to: "/login",
      });
    }
  },

  component: GestionSolicitudesPage,
});

function GestionSolicitudesPage() {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [fechaDesdeConsultada, setFechaDesdeConsultada] = useState("");
  const [fechaHastaConsultada, setFechaHastaConsultada] = useState("");

  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<number[]>(
    [],
  );
  const [
    usuariosSeleccionadosConsultados,
    setUsuariosSeleccionadosConsultados,
  ] = useState<number[]>([]);

  const [accionSolicitud, setAccionSolicitud] = useState<
    "APROBAR" | "RECHAZAR" | null
  >(null);

  const [mensajeProceso, setMensajeProceso] = useState<string | null>(null);
  const [errorProceso, setErrorProceso] = useState<string | null>(null);

  const [procesandoSolicitud, setProcesandoSolicitud] = useState(false);

  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [mostrarUsuarios, setMostrarUsuarios] = useState(false);

  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [estadoFiltroConsultado, setEstadoFiltroConsultado] = useState("TODOS");

  const [pagina, setPagina] = useState(1);
  const pageSize = 10;

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [solicitudAProcesar, setSolicitudAProcesar] =
    useState<SolicitudAdministrativa | null>(null);

  const usuarioSelectorRef = useRef<HTMLDivElement>(null);

  const { data: usuarios, isLoading: isLoadingUsuarios } = useUsuarios(1, 100);

  const usuariosFiltrados = useMemo(() => {
    const busqueda = busquedaUsuario.trim().toLowerCase();

    if (!busqueda) {
      return usuarios?.items ?? [];
    }

    return (
      usuarios?.items.filter((usuario) =>
        usuario.nombre.toLowerCase().includes(busqueda),
      ) ?? []
    );
  }, [usuarios?.items, busquedaUsuario]);

  const usuariosSeleccionadosData = useMemo(() => {
    return (
      usuarios?.items.filter((usuario) =>
        usuariosSeleccionados.includes(usuario.id),
      ) ?? []
    );
  }, [usuarios?.items, usuariosSeleccionados]);

  useEffect(() => {
    if (!mensajeProceso && !errorProceso) {
      return;
    }

    const timer = setTimeout(() => {
      setMensajeProceso(null);
      setErrorProceso(null);
    }, 8000);

    return () => clearTimeout(timer);
  }, [mensajeProceso, errorProceso]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        usuarioSelectorRef.current &&
        !usuarioSelectorRef.current.contains(event.target as Node)
      ) {
        setMostrarUsuarios(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleUsuario = (usuarioId: number) => {
    setUsuariosSeleccionados((actuales) =>
      actuales.includes(usuarioId)
        ? actuales.filter((id) => id !== usuarioId)
        : [...actuales, usuarioId],
    );
  };

  const quitarUsuario = (usuarioId: number) => {
    setUsuariosSeleccionados((actuales) =>
      actuales.filter((id) => id !== usuarioId),
    );
  };

  const filtrosConsulta = {
    usuariosIds:
      usuariosSeleccionadosConsultados.length > 0
        ? usuariosSeleccionadosConsultados
        : undefined,
    estado: estadoFiltroConsultado === "TODOS" ? null : estadoFiltroConsultado,
    fechaDesde: fechaDesdeConsultada
      ? `${fechaDesdeConsultada}T00:00:00-05:00`
      : "",
    fechaHasta: fechaHastaConsultada
      ? `${fechaHastaConsultada}T00:00:00-05:00`
      : "",
    page: pagina,
    pageSize,
  };

  const {
    data: solicitudes,
    isLoading: isLoadingSolicitudes,
    isFetching: isFetchingSolicitudes,
    error: errorSolicitudes,
    refetch,
  } = useSolicitudesAdministrativas(filtrosConsulta);

  const consultar = () => {
    if (!fechaDesde || !fechaHasta) {
      return;
    }

    if (fechaDesde > fechaHasta) {
      return;
    }

    setFechaDesdeConsultada(fechaDesde);
    setFechaHastaConsultada(fechaHasta);
    setUsuariosSeleccionadosConsultados(usuariosSeleccionados);
    setEstadoFiltroConsultado(estadoFiltro);
    setPagina(1);
  };

  const irAPaginaAnterior = () => {
    setPagina((actual) => Math.max(actual - 1, 1));
  };

  const irAPaginaSiguiente = () => {
    if (solicitudes && pagina < solicitudes.totalPages) {
      setPagina((actual) => actual + 1);
    }
  };

  const irAPrimeraPagina = () => {
    setPagina(1);
  };

  const irAUltimaPagina = () => {
    if (solicitudes) {
      setPagina(solicitudes.totalPages);
    }
  };

  const procesarSolicitud = async () => {
    if (!solicitudAProcesar || !accionSolicitud) {
      return;
    }

    setProcesandoSolicitud(true);
    setMensajeProceso(null);
    setErrorProceso(null);

    const estado = accionSolicitud === "APROBAR" ? "APROBADA" : "RECHAZADA";

    try {
      const response = await solicitudService.updateSolicitud({
        id: solicitudAProcesar.id,
        estado,
      });

      if (!response.isSuccess) {
        setErrorProceso(
          response.message || "No se pudo procesar la solicitud.",
        );
        return;
      }

      await refetch();

      setMensajeProceso(
        accionSolicitud === "APROBAR"
          ? "La solicitud fue aprobada correctamente."
          : "La solicitud fue rechazada correctamente.",
      );

      setMostrarConfirmacion(false);
      setSolicitudAProcesar(null);
      setAccionSolicitud(null);
    } catch (error) {
      if (error instanceof ApiError) {
        const data = error.data as {
          message?: string;
        };

        setErrorProceso(data.message ?? "No se pudo procesar la solicitud.");
        return;
      }

      setErrorProceso("No se pudo procesar la solicitud.");
    } finally {
      setProcesandoSolicitud(false);
    }
  };

  return (
    <main className="px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <h1 className="text-2xl font-semibold text-foreground">
          Gestión de Solicitudes
        </h1>

        <p className="mt-2 text-muted-foreground">
          Consulta y gestiona las solicitudes realizadas por los usuarios.
        </p>

        <div className="mt-6 rounded-lg border border-border p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div ref={usuarioSelectorRef} className="relative">
              <label
                htmlFor="usuario"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Usuario
              </label>

              <button
                id="usuario"
                type="button"
                onClick={() => setMostrarUsuarios((actual) => !actual)}
                disabled={isLoadingUsuarios}
                className="min-h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-left text-sm text-foreground outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoadingUsuarios ? (
                  <span className="text-muted-foreground">
                    Cargando usuarios...
                  </span>
                ) : usuariosSeleccionadosData.length === 0 ? (
                  <span className="text-muted-foreground">
                    Todos los usuarios
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {usuariosSeleccionadosData.map((usuario) => (
                      <span
                        key={usuario.id}
                        className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
                      >
                        {usuario.nombre}

                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation();
                            quitarUsuario(usuario.id);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              quitarUsuario(usuario.id);
                            }
                          }}
                          className="cursor-pointer text-muted-foreground hover:text-foreground"
                          aria-label={`Quitar ${usuario.nombre}`}
                        >
                          ×
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </button>

              {mostrarUsuarios && !isLoadingUsuarios && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-background p-2 shadow-lg">
                  <input
                    type="text"
                    value={busquedaUsuario}
                    onChange={(event) => setBusquedaUsuario(event.target.value)}
                    placeholder="Buscar usuario..."
                    autoFocus
                    className="mb-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />

                  <div className="max-h-60 overflow-y-auto">
                    {usuariosFiltrados.length === 0 ? (
                      <p className="px-2 py-3 text-sm text-muted-foreground">
                        No se encontraron usuarios.
                      </p>
                    ) : (
                      usuariosFiltrados.map((usuario) => {
                        const seleccionado = usuariosSeleccionados.includes(
                          usuario.id,
                        );

                        return (
                          <button
                            key={usuario.id}
                            type="button"
                            onClick={() => toggleUsuario(usuario.id)}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                          >
                            <span
                              className={`flex h-4 w-4 items-center justify-center rounded border ${
                                seleccionado
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border"
                              }`}
                            >
                              {seleccionado ? "✓" : ""}
                            </span>

                            <span>{usuario.nombre}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="estado"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Estado
              </label>

              <select
                id="estado"
                value={estadoFiltro}
                onChange={(event) => setEstadoFiltro(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="APROBADA">APROBADA</option>
                <option value="RECHAZADA">RECHAZADA</option>
              </select>
            </div>

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
                !fechaDesde ||
                !fechaHasta ||
                fechaDesde > fechaHasta ||
                isLoadingSolicitudes ||
                isFetchingSolicitudes
              }
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFetchingSolicitudes ? "Consultando..." : "Consultar"}
            </button>
          </div>
        </div>

        {errorSolicitudes && (
          <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {errorSolicitudes.message}
          </div>
        )}

        {mensajeProceso && (
          <div className="mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {mensajeProceso}
          </div>
        )}

        {errorProceso && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorProceso}
          </div>
        )}

        {(isLoadingSolicitudes || isFetchingSolicitudes) && (
          <div className="mt-6 rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
            Consultando solicitudes...
          </div>
        )}

        {solicitudes && !isLoadingSolicitudes && (
          <div className="mt-6 rounded-lg border border-border">
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Id</th>
                    <th className="px-4 py-3 text-left font-medium">Usuario</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Fecha solicitud
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Tipo</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Solicitud
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Hora actual
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Hora solicitada
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Motivo</th>
                    <th className="px-4 py-3 text-left font-medium">Estado</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {solicitudes.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No se encontraron solicitudes con los filtros
                        seleccionados.
                      </td>
                    </tr>
                  ) : (
                    solicitudes.items.map((solicitud) => (
                      <tr
                        key={solicitud.id}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-4 py-3">{solicitud.id}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {solicitud.usuarioNombre}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {new Date(solicitud.fechaSolicitud).toLocaleString(
                            "es-CO",
                            {
                              hour12: true,
                            },
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {solicitud.tipoRegistroNombre}
                        </td>
                        <td className="px-4 py-3">
                          {solicitud.registroId
                            ? "Modificación"
                            : "Nuevo registro"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {solicitud.horaActual
                            ? new Date(solicitud.horaActual).toLocaleString(
                                "es-CO",
                                {
                                  hour12: true,
                                },
                              )
                            : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {solicitud.horaSolicitada
                            ? new Date(solicitud.horaSolicitada).toLocaleString(
                                "es-CO",
                                {
                                  hour12: true,
                                },
                              )
                            : "—"}
                        </td>
                        <td className="max-w-xs px-4 py-3">
                          {solicitud.motivo}
                        </td>
                        <td className="px-4 py-3">{solicitud.estado}</td>
                        <td className="px-4 py-3">
                          {solicitud.estado === "PENDIENTE" ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                title="Aprobar solicitud"
                                aria-label="Aprobar solicitud"
                                onClick={() => {
                                  setSolicitudAProcesar(solicitud);
                                  setAccionSolicitud("APROBAR");
                                  setMostrarConfirmacion(true);
                                }}
                                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                              >
                                ✓
                              </button>

                              <button
                                type="button"
                                title="Rechazar solicitud"
                                aria-label="Rechazar solicitud"
                                onClick={() => {
                                  setSolicitudAProcesar(solicitud);
                                  setAccionSolicitud("RECHAZAR");
                                  setMostrarConfirmacion(true);
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm font-medium hover:bg-muted"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-muted-foreground">
                Página {solicitudes.page} de {solicitudes.totalPages} ·{" "}
                {solicitudes.total} solicitudes
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={irAPrimeraPagina}
                  disabled={pagina === 1}
                  className="rounded-md border border-border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Primera
                </button>

                <button
                  type="button"
                  onClick={irAPaginaAnterior}
                  disabled={pagina === 1}
                  className="rounded-md border border-border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>

                <button
                  type="button"
                  onClick={irAPaginaSiguiente}
                  disabled={pagina >= solicitudes.totalPages}
                  className="rounded-md border border-border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>

                <button
                  type="button"
                  onClick={irAUltimaPagina}
                  disabled={pagina >= solicitudes.totalPages}
                  className="rounded-md border border-border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Última
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={mostrarConfirmacion}
        title={
          accionSolicitud === "APROBAR"
            ? "Aprobar solicitud"
            : "Rechazar solicitud"
        }
        message={
          accionSolicitud === "APROBAR"
            ? "¿Está seguro de que desea aprobar esta solicitud?"
            : "¿Está seguro de que desea rechazar esta solicitud?"
        }
        confirmText={
          procesandoSolicitud
            ? "Procesando..."
            : accionSolicitud === "APROBAR"
              ? "Aprobar"
              : "Rechazar"
        }
        cancelText="Cancelar"
        onCancel={() => {
          setMostrarConfirmacion(false);
          setSolicitudAProcesar(null);
          setAccionSolicitud(null);
        }}
        onConfirm={procesarSolicitud}
        confirmDisabled={procesandoSolicitud}
      />
    </main>
  );
}
