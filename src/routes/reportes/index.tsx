import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useGenerarPlanillaJornada } from "@/hooks/useGenerarPlanillaJornada";
import { useGenerarPlanillaJornadaPdf } from "@/hooks/useGenerarPlanillaJornadaPdf";
import { useGenerarPlanillaJornadaPdfEmpleado } from "@/hooks/useGenerarPlanillaJornadaPdfEmpleado";
import { useAuth } from "@/auth/AuthProvider";
import { useUsuarios } from "@/hooks/useUsuarios";
import { useGenerarPlanillaJornadaEmpleado } from "@/hooks/useGenerarPlanillaJornadaEmpleado";

export const Route = createFileRoute("/reportes/")({
  component: ReportesPage,
});

function ReportesPage() {
  const { auth } = useAuth();

  const esAdministrador = auth?.roles.some(
    (rol) => rol.nombre === "ADMINISTRADOR",
  );

  const [reporteSeleccionado, setReporteSeleccionado] = useState("");

  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [fechaDesdeEmpleado, setFechaDesdeEmpleado] = useState("");
  const [fechaHastaEmpleado, setFechaHastaEmpleado] = useState("");
  const [idUsuarioSeleccionado, setIdUsuarioSeleccionado] = useState("");

  const generarPlanilla = useGenerarPlanillaJornada();
  const generarPlanillaPdf = useGenerarPlanillaJornadaPdf();
  const generarPlanillaPdfEmpleado = useGenerarPlanillaJornadaPdfEmpleado();
  const usuarios = useUsuarios(1, 100);
  const generarPlanillaEmpleado = useGenerarPlanillaJornadaEmpleado();

  const errorRango =
    fechaDesde && fechaHasta && fechaDesde > fechaHasta
      ? "La fecha inicial no puede ser posterior a la fecha final."
      : "";

  const fechaMaxima = fechaDesde ? new Date(`${fechaDesde}T00:00:00`) : null;

  if (fechaMaxima) {
    fechaMaxima.setMonth(fechaMaxima.getMonth() + 1);
  }

  const errorRangoMes =
    fechaDesde &&
    fechaHasta &&
    new Date(`${fechaHasta}T00:00:00`) > fechaMaxima!
      ? "El rango de fechas no puede ser superior a un mes."
      : "";

  const hoy = new Date().toISOString().split("T")[0];

  const errorFechaHoy =
    (fechaDesde && fechaDesde > hoy) || (fechaHasta && fechaHasta > hoy)
      ? "Las fechas no pueden ser posteriores a hoy."
      : "";

  const errorFecha = errorRango || errorRangoMes || errorFechaHoy;

  const errorRangoEmpleado =
    fechaDesdeEmpleado &&
    fechaHastaEmpleado &&
    fechaDesdeEmpleado > fechaHastaEmpleado
      ? "La fecha inicial no puede ser posterior a la fecha final."
      : "";

  const fechaMaximaEmpleado = fechaDesdeEmpleado
    ? new Date(`${fechaDesdeEmpleado}T00:00:00`)
    : null;

  if (fechaMaximaEmpleado) {
    fechaMaximaEmpleado.setMonth(fechaMaximaEmpleado.getMonth() + 1);
  }

  const errorRangoMesEmpleado =
    fechaDesdeEmpleado &&
    fechaHastaEmpleado &&
    new Date(`${fechaHastaEmpleado}T00:00:00`) > fechaMaximaEmpleado!
      ? "El rango de fechas no puede ser superior a un mes."
      : "";

  const errorFechaHoyEmpleado =
    (fechaDesdeEmpleado && fechaDesdeEmpleado > hoy) ||
    (fechaHastaEmpleado && fechaHastaEmpleado > hoy)
      ? "Las fechas no pueden ser posteriores a hoy."
      : "";

  const errorFechaEmpleado =
    errorRangoEmpleado || errorRangoMesEmpleado || errorFechaHoyEmpleado;

  const planillaActual =
    reporteSeleccionado === "control-jornadas-empleado"
      ? generarPlanillaEmpleado.data
      : generarPlanilla.data;

  const obtenerClaseFila = (clasificacion: string, tieneNovedad: boolean) => {
    if (tieneNovedad) {
      return "bg-yellow-100";
    }

    switch (clasificacion) {
      case "JORNADA":
        return "";

      case "NOVEDAD":
        return "bg-yellow-100";

      case "DESCANSO":
        return "bg-blue-100";

      case "DOMINGO":
      case "FESTIVO":
      case "DOMINGO_FESTIVO":
      case "JORNADA_DOMINGO_FESTIVO":
        return "bg-red-300";

      default:
        return "";
    }
  };

  const descargarPlanillaPdf = async () => {
    if (!fechaDesde || !fechaHasta || errorFecha) {
      return;
    }

    const pdf = await generarPlanillaPdf.mutateAsync({
      fechaDesde,
      fechaHasta,
    });

    const url = URL.createObjectURL(pdf);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = "PlanillaJornada.pdf";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(url);
  };

  const descargarPlanillaPdfEmpleado = async () => {
    if (!fechaDesdeEmpleado || !fechaHastaEmpleado || errorFechaEmpleado) {
      return;
    }

    const pdf = await generarPlanillaPdfEmpleado.mutateAsync({
      idUsuario: Number(idUsuarioSeleccionado),
      fechaDesde: fechaDesdeEmpleado,
      fechaHasta: fechaHastaEmpleado,
    });

    const url = URL.createObjectURL(pdf);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = "PlanillaJornada.pdf";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <main className="px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reportes</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Seleccione el reporte que desea generar.
          </p>
        </div>
        <div className="w-full max-w-3xl space-y-2">
          <label
            htmlFor="reporte"
            className="text-sm font-medium text-foreground"
          >
            Reporte
          </label>

          <select
            id="reporte"
            value={reporteSeleccionado}
            onChange={(event) => {
              setReporteSeleccionado(event.target.value);
              generarPlanilla.reset();
              generarPlanillaPdf.reset();
              generarPlanillaEmpleado.reset();
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Seleccione un reporte</option>
            <option value="planilla-jornada">
              Planilla de jornada de trabajo
            </option>
            {esAdministrador && (
              <option value="control-jornadas-empleado">
                Control de jornadas por empleado
              </option>
            )}
          </select>
        </div>
        {reporteSeleccionado === "planilla-jornada" && (
          <div className="w-full max-w-5xl rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Planilla de jornada de trabajo
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Seleccione el rango de fechas para generar la planilla.
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
              <div className="space-y-1">
                <label
                  htmlFor="fechaDesde"
                  className="block text-sm font-medium text-foreground"
                >
                  Fecha desde
                </label>

                <input
                  id="fechaDesde"
                  type="date"
                  value={fechaDesde}
                  onChange={(event) => setFechaDesde(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="fechaHasta"
                  className="block text-sm font-medium text-foreground"
                >
                  Fecha hasta
                </label>

                <input
                  id="fechaHasta"
                  type="date"
                  value={fechaHasta}
                  onChange={(event) => setFechaHasta(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!fechaDesde || !fechaHasta || errorFecha) {
                    return;
                  }

                  generarPlanilla.mutate({
                    fechaDesde,
                    fechaHasta,
                  });
                }}
                disabled={generarPlanilla.isPending || !!errorFecha}
                className="w-full rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
              >
                {generarPlanilla.isPending
                  ? "Consultando..."
                  : "Generar planilla"}
              </button>
              <button
                type="button"
                onClick={() => {
                  descargarPlanillaPdf().catch(() => {});
                }}
                disabled={
                  generarPlanillaPdf.isPending ||
                  !fechaDesde ||
                  !fechaHasta ||
                  !!errorFecha
                }
                className="w-full rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
              >
                {generarPlanillaPdf.isPending
                  ? "Generando PDF..."
                  : "Descargar PDF"}
              </button>
            </div>
          </div>
        )}

        {reporteSeleccionado === "control-jornadas-empleado" &&
          esAdministrador && (
            <div className="w-full max-w-5xl rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Control de jornadas por empleado
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Seleccione el empleado y el rango de fechas para consultar sus
                jornadas.
              </p>
              <div className="mt-6 max-w-xl">
                <label
                  htmlFor="empleado"
                  className="text-sm font-medium text-foreground"
                >
                  Empleado
                </label>
                <select
                  id="empleado"
                  value={idUsuarioSeleccionado}
                  onChange={(event) =>
                    setIdUsuarioSeleccionado(event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Seleccione un empleado</option>
                  {usuarios.data?.items.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} ({usuario.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fechaDesdeEmpleado"
                    className="text-sm font-medium text-foreground"
                  >
                    Fecha desde
                  </label>
                  <input
                    id="fechaDesdeEmpleado"
                    type="date"
                    value={fechaDesdeEmpleado}
                    onChange={(event) =>
                      setFechaDesdeEmpleado(event.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label
                    htmlFor="fechaHastaEmpleado"
                    className="text-sm font-medium text-foreground"
                  >
                    Fecha hasta
                  </label>
                  <input
                    id="fechaHastaEmpleado"
                    type="date"
                    value={fechaHastaEmpleado}
                    onChange={(event) =>
                      setFechaHastaEmpleado(event.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      !idUsuarioSeleccionado ||
                      !fechaDesdeEmpleado ||
                      !fechaHastaEmpleado ||
                      errorFechaEmpleado
                    ) {
                      return;
                    }

                    generarPlanillaEmpleado.mutate({
                      idUsuario: Number(idUsuarioSeleccionado),
                      fechaDesde: fechaDesdeEmpleado,
                      fechaHasta: fechaHastaEmpleado,
                    });
                  }}
                  disabled={
                    !idUsuarioSeleccionado ||
                    !fechaDesdeEmpleado ||
                    !fechaHastaEmpleado ||
                    !!errorFechaEmpleado ||
                    generarPlanillaEmpleado.isPending
                  }
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generarPlanillaEmpleado.isPending
                    ? "Generando..."
                    : "Generar reporte"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    descargarPlanillaPdfEmpleado().catch(() => {});
                  }}
                  disabled={
                    !idUsuarioSeleccionado ||
                    !fechaDesdeEmpleado ||
                    !fechaHastaEmpleado ||
                    !!errorFechaEmpleado ||
                    generarPlanillaPdfEmpleado.isPending
                  }
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generarPlanillaPdfEmpleado.isPending
                    ? "Generando PDF..."
                    : "Descargar PDF"}
                </button>
              </div>
            </div>
          )}
        {generarPlanilla.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {generarPlanilla.error.message}
          </div>
        )}
        {generarPlanillaPdf.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {generarPlanillaPdf.error.message}
          </div>
        )}
        {generarPlanillaEmpleado.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {generarPlanillaEmpleado.error.message}
          </div>
        )}

        {errorFechaEmpleado &&
          reporteSeleccionado === "control-jornadas-empleado" && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {errorFechaEmpleado}
            </div>
          )}
        {errorFecha && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {errorFecha}
          </div>
        )}
        {planillaActual && (
          <div className="w-full overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-3 text-center font-medium text-foreground">
                    Día
                  </th>

                  <th className="px-3 py-3 text-center font-medium text-foreground">
                    Fecha
                  </th>

                  <th className="px-3 py-3 text-center font-medium text-foreground">
                    Entrada
                  </th>

                  <th className="px-3 py-3 text-center font-medium text-foreground">
                    Ingreso Receso
                  </th>

                  <th className="px-3 py-3 text-center font-medium text-foreground">
                    Entrada Receso
                  </th>

                  <th className="px-3 py-3 text-center font-medium text-foreground">
                    Salida
                  </th>

                  <th className="px-3 py-3 text-center font-medium text-foreground">
                    Total
                  </th>

                  <th className="px-3 py-3 text-center font-medium text-foreground">
                    Clasificación
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {planillaActual.detalles.map((detalle) => (
                  <tr
                    key={detalle.fecha}
                    className={obtenerClaseFila(
                      detalle.clasificacion,
                      detalle.tieneNovedad,
                    )}
                  >
                    <td className="px-3 py-3 text-center text-foreground">
                      {detalle.dia}
                    </td>

                    <td className="px-3 py-3 text-center text-foreground">
                      {new Date(detalle.fecha).toLocaleDateString("es-CO")}
                    </td>

                    <td className="px-3 py-3 text-center text-foreground">
                      {detalle.entrada}
                    </td>

                    <td className="px-3 py-3 text-center text-foreground">
                      {detalle.ingresoReceso}
                    </td>

                    <td className="px-3 py-3 text-center text-foreground">
                      {detalle.entradaReceso}
                    </td>

                    <td className="px-3 py-3 text-center text-foreground">
                      {detalle.salida}
                    </td>

                    <td className="px-3 py-3 text-center font-medium text-foreground">
                      {detalle.totalHorasJornada}
                    </td>

                    <td className="px-3 py-3 text-center text-foreground">
                      {detalle.esDomingoOFestivo &&
                      !detalle.tieneNovedad &&
                      detalle.clasificacion !== "JORNADA_DOMINGO_FESTIVO"
                        ? "DESCANSO"
                        : detalle.clasificacion}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-border bg-muted">
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-3 text-right font-semibold text-foreground"
                  >
                    Total horas jornada
                  </td>

                  <td className="px-3 py-3 font-bold text-foreground">
                    {planillaActual.totalHorasJornada}
                  </td>

                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
