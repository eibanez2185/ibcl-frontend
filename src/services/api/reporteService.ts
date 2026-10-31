import { apiClient } from "./apiClient";
import type { ApiResponse } from "@/types/apiResponse";
import type {
  ConsultaPlanillaJornada,
  ConsultaPlanillaJornadaEmpleado,
  PlanillaJornada,
} from "@/types/reporte";

export const reporteService = {
  generarPlanillaJornada: (
    filtros: ConsultaPlanillaJornada,
  ): Promise<ApiResponse<PlanillaJornada>> => {
    return apiClient.post(
      "/Reportes/GenerarPlanillaJornadaAsync",
      filtros,
    );
  },

    generarPlanillaJornadaPdf: (
        filtros: ConsultaPlanillaJornada,
    ): Promise<Blob> => {
    return apiClient.postBlob(
        "/Reportes/GenerarPlanillaJornadaPdfAsync",
        filtros,
    );
 },

 generarPlanillaJornadaPdfEmpleado: (
        filtros: ConsultaPlanillaJornadaEmpleado,
    ): Promise<Blob> => {
    return apiClient.postBlob(
        "/Reportes/GenerarPlanillaJornadaPdfEmpleadoAsync",
        filtros,
    );
 },

    generarPlanillaJornadaEmpleado: (
      filtros: ConsultaPlanillaJornadaEmpleado
    ): Promise<ApiResponse<PlanillaJornada>> => {
      return apiClient.post("/Reportes/GenerarPlanillaJornadaEmpleadoAsync", filtros);
  },
};



