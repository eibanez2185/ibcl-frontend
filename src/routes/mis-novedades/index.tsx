import { useEffect, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { authStorage } from "@/services/auth/authStorage";
import { useMisNovedades } from "@/hooks/useMisNovedades";
import { useTipoNovedades } from "@/hooks/useTipoNovedades";
import { useInsertNovedad } from "@/hooks/useInsertNovedad";
import { useForm } from "@/hooks/useForm";
import { Dialog } from "@/components/common/Dialog";

export const Route = createFileRoute("/mis-novedades/")({
  beforeLoad: () => {
    const auth = authStorage.get();

    if (!auth) {
      throw redirect({
        to: "/login",
      });
    }
  },

  component: MisNovedadesPage,
});

function MisNovedadesPage() {
  const queryClient = useQueryClient();

  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [estado, setEstado] = useState("TODOS");
  const [tipoNovedadId, setTipoNovedadId] = useState("TODOS");

  const [fechaDesdeConsultada, setFechaDesdeConsultada] = useState<
    string | null
  >(null);
  const [fechaHastaConsultada, setFechaHastaConsultada] = useState<
    string | null
  >(null);
  const [estadoConsultado, setEstadoConsultado] = useState<string | null>(null);
  const [tipoNovedadIdConsultado, setTipoNovedadIdConsultado] = useState<
    number | null
  >(null);

  const [consultaRealizada, setConsultaRealizada] = useState(false);

  const [pagina, setPagina] = useState(1);

  const pageSize = 10;

  const { data: tiposNovedad, isLoading: tiposNovedadLoading } =
    useTipoNovedades();

  const insertNovedad = useInsertNovedad();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [mensajeFormulario, setMensajeFormulario] = useState<string | null>(
    null,
  );

  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const formularioNovedad = useForm({
    tipoNovedadId: "",
    fechaInicio: "",
    fechaFin: "",
    descripcion: "",
  });

  const { data, isLoading, error } = useMisNovedades(
    {
      fechaDesde: fechaDesdeConsultada,
      fechaHasta: fechaHastaConsultada,
      estado: estadoConsultado,
      tipoNovedadId: tipoNovedadIdConsultado,
      incluirInactivos: false,
      page: pagina,
      pageSize,
    },
    consultaRealizada,
  );

  useEffect(() => {
    if (!mensajeExito) {
      return;
    }

    const timer = window.setTimeout(() => {
      setMensajeExito(null);
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [mensajeExito]);

  const consultar = () => {
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      return;
    }

    setPagina(1);

    setFechaDesdeConsultada(fechaDesde ? `${fechaDesde}T00:00:00-05:00` : null);

    setFechaHastaConsultada(fechaHasta ? `${fechaHasta}T00:00:00-05:00` : null);

    setEstadoConsultado(estado === "TODOS" ? null : estado);

    setTipoNovedadIdConsultado(
      tipoNovedadId === "TODOS" ? null : Number(tipoNovedadId),
    );

    setConsultaRealizada(true);
  };

  const registrarNovedad = async () => {
    formularioNovedad.clearErrors();
    setMensajeFormulario(null);

    let formularioValido = true;

    if (!formularioNovedad.values.tipoNovedadId) {
      formularioNovedad.setError(
        "tipoNovedadId",
        "Debe seleccionar un tipo de novedad.",
      );
      formularioValido = false;
    }

    if (!formularioNovedad.values.fechaInicio) {
      formularioNovedad.setError(
        "fechaInicio",
        "Debe indicar la fecha de inicio.",
      );
      formularioValido = false;
    }

    if (!formularioNovedad.values.fechaFin) {
      formularioNovedad.setError("fechaFin", "Debe indicar la fecha de fin.");
      formularioValido = false;
    }

    if (
      formularioNovedad.values.fechaInicio &&
      formularioNovedad.values.fechaFin &&
      formularioNovedad.values.fechaFin < formularioNovedad.values.fechaInicio
    ) {
      formularioNovedad.setError(
        "fechaFin",
        "La fecha fin debe ser mayor o igual a la fecha inicio.",
      );
      formularioValido = false;
    }

    if (!formularioNovedad.values.descripcion.trim()) {
      formularioNovedad.setError(
        "descripcion",
        "Debe indicar una descripción.",
      );
      formularioValido = false;
    }

    if (!formularioValido) {
      return;
    }

    try {
      const response = await insertNovedad.mutateAsync({
        tipoNovedadId: Number(formularioNovedad.values.tipoNovedadId),
        fechaInicio: `${formularioNovedad.values.fechaInicio}T05:00:00.000Z`,
        fechaFin: `${formularioNovedad.values.fechaFin}T05:00:00.000Z`,
        descripcion: formularioNovedad.values.descripcion.trim(),
      });

      if (!response.isSuccess) {
        setMensajeFormulario(
          response.message || "No se pudo registrar la novedad.",
        );
        return;
      }

      formularioNovedad.reset();
      setMostrarFormulario(false);

      setMensajeExito(response.message || "Novedad registrada correctamente.");

      await queryClient.invalidateQueries({
        queryKey: ["mis-novedades"],
      });
    } catch (error) {
      if (error && typeof error === "object" && "data" in error) {
        const apiError = error as {
          data?: {
            message?: string;
          };
        };

        setMensajeFormulario(
          apiError.data?.message || "No se pudo registrar la novedad.",
        );

        return;
      }

      setMensajeFormulario("No se pudo registrar la novedad.");
    }
  };
  return (
    <main className="px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Mis Novedades
            </h1>

            <p className="mt-2 text-muted-foreground">
              Consulta tus novedades registradas.
            </p>
          </div>

          <div
            className={`mb-4 overflow-hidden transition-all duration-500 ${
              mensajeExito ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700">
              {mensajeExito}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              formularioNovedad.reset();
              setMensajeFormulario(null);
              setMostrarFormulario(true);
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Registrar novedad
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-border p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

            <div>
              <label
                htmlFor="estado"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Estado
              </label>

              <select
                id="estado"
                value={estado}
                onChange={(event) => setEstado(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="TODOS">TODOS</option>
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
                value={tipoNovedadId}
                onChange={(event) => setTipoNovedadId(event.target.value)}
                disabled={tiposNovedadLoading}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="TODOS">TODOS</option>

                {tiposNovedad?.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
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
            Consultando novedades...
          </p>
        )}

        {error && (
          <p className="mt-6 text-sm text-destructive">{error.message}</p>
        )}

        {data && (
          <div className="mt-6">
            <p className="mb-4 text-sm text-muted-foreground">
              Novedades encontradas: {data.total}
            </p>

            {data.items.length === 0 ? (
              <div className="rounded-lg border border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No se encontraron novedades para los filtros seleccionados.
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
                        Fecha inicio
                      </th>

                      <th className="px-4 py-3 text-left font-medium text-foreground">
                        Fecha fin
                      </th>

                      <th className="px-4 py-3 text-left font-medium text-foreground">
                        Tipo de novedad
                      </th>

                      <th className="px-4 py-3 text-left font-medium text-foreground">
                        Descripción
                      </th>

                      <th className="px-4 py-3 text-left font-medium text-foreground">
                        Estado
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.items.map((novedad) => (
                      <tr
                        key={novedad.id}
                        className="border-b border-border last:border-b-0 hover:bg-muted/50"
                      >
                        <td className="px-4 py-3 text-foreground">
                          {novedad.id}
                        </td>

                        <td className="px-4 py-3 text-foreground">
                          {new Date(novedad.fechaInicio).toLocaleString()}
                        </td>

                        <td className="px-4 py-3 text-foreground">
                          {new Date(novedad.fechaFin).toLocaleString()}
                        </td>

                        <td className="px-4 py-3 text-foreground">
                          {novedad.tipoNovedadNombre}
                        </td>

                        <td className="max-w-[300px] px-4 py-3 text-foreground">
                          <span
                            className="block truncate"
                            title={novedad.descripcion ?? ""}
                          >
                            {novedad.descripcion || "—"}
                          </span>
                        </td>

                        <td className="px-4 py-3 font-medium text-foreground">
                          {novedad.estado}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      onClick={() =>
                        setPagina((paginaActual) => paginaActual - 1)
                      }
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
                      onClick={() =>
                        setPagina((paginaActual) => paginaActual + 1)
                      }
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
        )}
      </div>

      <Dialog
        open={mostrarFormulario}
        title="Registrar novedad"
        onClose={() => setMostrarFormulario(false)}
      >
        <div>
          {mensajeFormulario && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {mensajeFormulario}
            </div>
          )}
          <label
            htmlFor="nuevoTipoNovedad"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Tipo de novedad <span className="text-destructive">*</span>
          </label>

          <select
            id="nuevoTipoNovedad"
            value={formularioNovedad.values.tipoNovedadId}
            onChange={(event) =>
              formularioNovedad.setValue("tipoNovedadId", event.target.value)
            }
            disabled={tiposNovedadLoading}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Seleccione un tipo de novedad</option>

            {tiposNovedad?.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>

          {formularioNovedad.errors.tipoNovedadId && (
            <p className="mt-1 text-sm text-destructive">
              {formularioNovedad.errors.tipoNovedadId}
            </p>
          )}
        </div>

        <div className="mt-4">
          <label
            htmlFor="nuevaFechaInicio"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Fecha inicio <span className="text-destructive">*</span>
          </label>

          <input
            id="nuevaFechaInicio"
            type="date"
            value={formularioNovedad.values.fechaInicio}
            onChange={(event) =>
              formularioNovedad.setValue("fechaInicio", event.target.value)
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />

          {formularioNovedad.errors.fechaInicio && (
            <p className="mt-1 text-sm text-destructive">
              {formularioNovedad.errors.fechaInicio}
            </p>
          )}
        </div>

        <div className="mt-4">
          <label
            htmlFor="nuevaFechaFin"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Fecha fin <span className="text-destructive">*</span>
          </label>

          <input
            id="nuevaFechaFin"
            type="date"
            value={formularioNovedad.values.fechaFin}
            onChange={(event) =>
              formularioNovedad.setValue("fechaFin", event.target.value)
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />

          {formularioNovedad.errors.fechaFin && (
            <p className="mt-1 text-sm text-destructive">
              {formularioNovedad.errors.fechaFin}
            </p>
          )}
        </div>

        <div className="mt-4">
          <label
            htmlFor="nuevaDescripcion"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Descripción <span className="text-destructive">*</span>
          </label>

          <textarea
            id="nuevaDescripcion"
            value={formularioNovedad.values.descripcion}
            onChange={(event) =>
              formularioNovedad.setValue("descripcion", event.target.value)
            }
            rows={4}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />

          {formularioNovedad.errors.descripcion && (
            <p className="mt-1 text-sm text-destructive">
              {formularioNovedad.errors.descripcion}
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              formularioNovedad.reset();
              setMostrarFormulario(false);
            }}
            disabled={insertNovedad.isPending}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={registrarNovedad}
            disabled={insertNovedad.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {insertNovedad.isPending ? "Registrando..." : "Registrar"}
          </button>
        </div>
      </Dialog>
    </main>
  );
}
