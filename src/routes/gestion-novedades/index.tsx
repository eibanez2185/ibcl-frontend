import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { novedadService } from "@/services/api/novedadService";
import { ApiError } from "@/services/api/apiClient";

import { authStorage } from "@/services/auth/authStorage";
import { useNovedadesAdministrativas } from "@/hooks/useNovedadesAdministrativas";
import { useUsuarios } from "@/hooks/useUsuarios";
import { useTipoNovedades } from "@/hooks/useTipoNovedades";
import type { Novedad } from "@/types/novedad";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

export const Route = createFileRoute("/gestion-novedades/")({
  beforeLoad: () => {
    const auth = authStorage.get();

    if (!auth) {
      throw redirect({
        to: "/login",
      });
    }
  },

  component: GestionNovedadesPage,
});

function GestionNovedadesPage() {
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

  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [mostrarUsuarios, setMostrarUsuarios] = useState(false);

  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [estadoFiltroConsultado, setEstadoFiltroConsultado] = useState("TODOS");

  const [tipoNovedadFiltro, setTipoNovedadFiltro] = useState("TODOS");
  const [tipoNovedadFiltroConsultado, setTipoNovedadFiltroConsultado] =
    useState("TODOS");

  const [pagina, setPagina] = useState(1);
  const pageSize = 10;

  const [accionNovedad, setAccionNovedad] = useState<
    "APROBAR" | "RECHAZAR" | null
  >(null);

  const [novedadAProcesar, setNovedadAProcesar] = useState<Novedad | null>(
    null,
  );
  const [procesandoNovedad, setProcesandoNovedad] = useState(false);

  const [mensajeProceso, setMensajeProceso] = useState<string | null>(null);
  const [errorProceso, setErrorProceso] = useState<string | null>(null);

  const [mostrarMensajeProceso, setMostrarMensajeProceso] = useState(false);

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const usuarioSelectorRef = useRef<HTMLDivElement>(null);

  const { data: usuarios, isLoading: isLoadingUsuarios } = useUsuarios(1, 100);
  const { data: tiposNovedad, isLoading: isLoadingTiposNovedad } =
    useTipoNovedades();

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

  useEffect(() => {
    if (!mensajeProceso) {
      return;
    }

    setMostrarMensajeProceso(true);

    const timer = setTimeout(() => {
      setMostrarMensajeProceso(false);

      setTimeout(() => {
        setMensajeProceso(null);
      }, 300);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [mensajeProceso]);

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
    tipoNovedadId:
      tipoNovedadFiltroConsultado === "TODOS"
        ? null
        : Number(tipoNovedadFiltroConsultado),
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
    data: novedades,
    isLoading: isLoadingNovedades,
    isFetching: isFetchingNovedades,
    error: errorNovedades,
    refetch,
  } = useNovedadesAdministrativas(filtrosConsulta);

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
    setTipoNovedadFiltroConsultado(tipoNovedadFiltro);
    setPagina(1);
  };

  const irAPaginaAnterior = () => {
    setPagina((actual) => Math.max(actual - 1, 1));
  };

  const irAPaginaSiguiente = () => {
    if (novedades && pagina < novedades.totalPages) {
      setPagina((actual) => actual + 1);
    }
  };

  const irAPrimeraPagina = () => {
    setPagina(1);
  };

  const irAUltimaPagina = () => {
    if (novedades) {
      setPagina(novedades.totalPages);
    }
  };

  const procesarNovedad = async () => {
    if (!novedadAProcesar || !accionNovedad) {
      return;
    }

    setProcesandoNovedad(true);
    setMensajeProceso(null);
    setErrorProceso(null);

    try {
      const estado = accionNovedad === "APROBAR" ? "APROBADA" : "RECHAZADA";

      const response = await novedadService.updateNovedad({
        id: novedadAProcesar.id,
        estado,
      });

      if (!response.isSuccess) {
        throw new Error(response.message ?? "No se pudo procesar la novedad.");
      }

      setMostrarConfirmacion(false);
      setNovedadAProcesar(null);
      setAccionNovedad(null);

      setMensajeProceso(
        estado === "APROBADA"
          ? "La novedad fue aprobada correctamente."
          : "La novedad fue rechazada correctamente.",
      );

      await refetch();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorProceso(
          typeof error.data === "object" &&
            error.data !== null &&
            "message" in error.data
            ? String(error.data.message)
            : "No se pudo procesar la novedad.",
        );
      } else if (error instanceof Error) {
        setErrorProceso(error.message);
      } else {
        setErrorProceso("No se pudo procesar la novedad.");
      }
    } finally {
      setProcesandoNovedad(false);
    }
  };

  return (
    <main className="px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <h1 className="text-2xl font-semibold text-foreground">
          Gestión de Novedades
        </h1>

        <p className="mt-2 text-muted-foreground">
          Consulta y gestiona las novedades realizadas por los usuarios.
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
                htmlFor="tipoNovedad"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Tipo de novedad
              </label>

              <select
                id="tipoNovedad"
                value={tipoNovedadFiltro}
                onChange={(event) => setTipoNovedadFiltro(event.target.value)}
                disabled={isLoadingTiposNovedad}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="TODOS">Todos los tipos</option>

                {tiposNovedad?.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
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
                isLoadingNovedades ||
                isFetchingNovedades
              }
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFetchingNovedades ? "Consultando..." : "Consultar"}
            </button>
          </div>
        </div>

        {mensajeProceso && (
          <div
            className={`mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 transition-opacity duration-300 ${
              mostrarMensajeProceso ? "opacity-100" : "opacity-0"
            }`}
          >
            {mensajeProceso}
          </div>
        )}

        {errorProceso && (
          <div
            className={`mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive transition-opacity duration-300 ${
              mostrarMensajeProceso ? "opacity-100" : "opacity-0"
            }`}
          >
            {errorProceso}
          </div>
        )}

        {errorNovedades && (
          <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {errorNovedades.message}
          </div>
        )}

        {(isLoadingNovedades || isFetchingNovedades) && (
          <div className="mt-6 rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
            Consultando novedades...
          </div>
        )}

        {novedades && !isLoadingNovedades && (
          <div className="mt-6 rounded-lg border border-border p-4">
            <div className="mb-4">
              Página {novedades.page} de {novedades.totalPages} ·{" "}
              {novedades.total} novedades
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="border-b border-border bg-muted">
                  <tr className="border-b border-border">
                    <th className="px-3 py-3 font-medium text-foreground">
                      ID
                    </th>
                    <th className="px-3 py-3 font-medium text-foreground">
                      Usuario
                    </th>
                    <th className="px-3 py-3 font-medium text-foreground">
                      Tipo de novedad
                    </th>
                    <th className="px-3 py-3 font-medium text-foreground">
                      Fecha inicio
                    </th>
                    <th className="px-3 py-3 font-medium text-foreground">
                      Fecha fin
                    </th>
                    <th className="px-3 py-3 font-medium text-foreground">
                      Descripción
                    </th>
                    <th className="px-3 py-3 font-medium text-foreground">
                      Estado
                    </th>
                    <th className="px-3 py-3 font-medium text-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {novedades.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-3 py-6 text-center text-muted-foreground"
                      >
                        No se encontraron novedades.
                      </td>
                    </tr>
                  ) : (
                    novedades.items.map((novedad) => (
                      <tr
                        key={novedad.id}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-3 py-3 text-foreground">
                          {novedad.id}
                        </td>

                        <td className="px-3 py-3 text-foreground">
                          {novedad.usuarioNombre}
                        </td>

                        <td className="px-3 py-3 text-foreground">
                          {novedad.tipoNovedadNombre}
                        </td>

                        <td className="px-3 py-3 text-foreground">
                          {new Date(novedad.fechaInicio).toLocaleDateString()}
                        </td>

                        <td className="px-3 py-3 text-foreground">
                          {new Date(novedad.fechaFin).toLocaleDateString()}
                        </td>

                        <td className="px-3 py-3 text-foreground">
                          {novedad.descripcion || "-"}
                        </td>

                        <td className="px-3 py-3 text-foreground">
                          {novedad.estado}
                        </td>
                        <td className="px-3 py-3">
                          {novedad.estado === "PENDIENTE" && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                title="Aprobar novedad"
                                onClick={() => {
                                  setNovedadAProcesar(novedad);
                                  setAccionNovedad("APROBAR");
                                  setMostrarConfirmacion(true);
                                }}
                                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                              >
                                ✓
                              </button>

                              <button
                                type="button"
                                title="Rechazar novedad"
                                onClick={() => {
                                  setNovedadAProcesar(novedad);
                                  setAccionNovedad("RECHAZAR");
                                  setMostrarConfirmacion(true);
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm font-medium hover:bg-muted"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex gap-2">
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
                disabled={pagina >= novedades.totalPages}
                className="rounded-md border border-border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>

              <button
                type="button"
                onClick={irAUltimaPagina}
                disabled={pagina >= novedades.totalPages}
                className="rounded-md border border-border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Última
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={mostrarConfirmacion}
        title={
          accionNovedad === "APROBAR" ? "Aprobar novedad" : "Rechazar novedad"
        }
        message={
          accionNovedad === "APROBAR"
            ? "¿Está seguro de que desea aprobar esta novedad?"
            : "¿Está seguro de que desea rechazar esta novedad?"
        }
        confirmText={
          procesandoNovedad
            ? "Procesando..."
            : accionNovedad === "APROBAR"
              ? "Aprobar"
              : "Rechazar"
        }
        cancelText="Cancelar"
        onCancel={() => {
          setMostrarConfirmacion(false);
          setNovedadAProcesar(null);
          setAccionNovedad(null);
        }}
        onConfirm={procesarNovedad}
        confirmDisabled={procesandoNovedad}
      />
    </main>
  );
}
