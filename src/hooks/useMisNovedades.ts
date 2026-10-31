import { useQuery } from "@tanstack/react-query";

import {
  novedadService,
  type ConsultaMisNovedadesRequest,
} from "@/services/api/novedadService";
import type { MisNovedadesPagedResult } from "@/types/novedad";

export function useMisNovedades(
  filtros: ConsultaMisNovedadesRequest,
  habilitarConsulta: boolean,
) {
  return useQuery<MisNovedadesPagedResult, Error>({
    queryKey: [
      "mis-novedades",
      filtros,
    ],

    queryFn: async () => {
      const response = await novedadService.getMisNovedades(filtros);

      if (!response.isSuccess) {
        throw new Error(
          response.message || "No se pudieron consultar las novedades.",
        );
      }

      return response.data;
    },

    enabled: habilitarConsulta,
  });
}