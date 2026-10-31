import { ApiError } from "@/services/api/apiClient";
import { useMutation } from "@tanstack/react-query";

import { reporteService } from "@/services/api/reporteService";
import type { ConsultaPlanillaJornadaEmpleado } from "@/types/reporte";

export function useGenerarPlanillaJornadaPdfEmpleado() {
  return useMutation<Blob, Error, ConsultaPlanillaJornadaEmpleado>({
    mutationFn: (filtros) =>
      reporteService.generarPlanillaJornadaPdfEmpleado(filtros),

    onError: (error) => {
      if (error instanceof ApiError) {
        error.message =
          typeof error.data === "object" &&
          error.data !== null &&
          "message" in error.data
            ? String(error.data.message)
            : "No se pudo generar el PDF de la planilla.";
      }
    },
  });
}
