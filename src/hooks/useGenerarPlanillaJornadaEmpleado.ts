import { ApiError } from "@/services/api/apiClient";
import { useMutation } from "@tanstack/react-query";
import { reporteService } from "@/services/api/reporteService";
import type {
  ConsultaPlanillaJornadaEmpleado,
  PlanillaJornada,
} from "@/types/reporte";

export function useGenerarPlanillaJornadaEmpleado() {
  return useMutation<
    PlanillaJornada,
    Error,
    ConsultaPlanillaJornadaEmpleado
  >({
    mutationFn: async (filtros) => {
      const response =
        await reporteService.generarPlanillaJornadaEmpleado(filtros);

      if (!response.isSuccess) {
        throw new Error(
          response.message ?? "No se pudo generar el reporte del empleado.",
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
            : "No se pudo generar el reporte del empleado.";
      }
    },
  });
}