import { ApiError } from "@/services/api/apiClient";
import { useMutation } from "@tanstack/react-query";

import { reporteService } from "@/services/api/reporteService";
import type { ConsultaPlanillaJornada } from "@/types/reporte";

export function useGenerarPlanillaJornadaPdf() {
  return useMutation<Blob, Error, ConsultaPlanillaJornada>({
    mutationFn: (filtros) =>
      reporteService.generarPlanillaJornadaPdf(filtros),

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
