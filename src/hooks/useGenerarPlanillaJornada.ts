import { ApiError } from "@/services/api/apiClient";
import { useMutation } from "@tanstack/react-query";

import { reporteService } from "@/services/api/reporteService";
import type {
  ConsultaPlanillaJornada,
  PlanillaJornada,
} from "@/types/reporte";

export function useGenerarPlanillaJornada() {
  return useMutation<PlanillaJornada, Error, ConsultaPlanillaJornada>({
    mutationFn: async (filtros) => {
      const response =
        await reporteService.generarPlanillaJornada(filtros);

      if (!response.isSuccess) {
        throw new Error(
          response.message ?? "No se pudo generar la planilla.",
        );
      }

      return response.data;
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        error.message =
          typeof error.data === "object" &&
          error.data !== null &&
          "message" in error.data
            ? String(error.data.message)
            : "No se pudo generar la planilla.";
      }
    },

  });
}