import { useQuery } from "@tanstack/react-query";
import { jornadaService } from "@/services/api/jornadaService";
import type { MisJornada } from "@/types/jornada";

export interface MisJornadasPagedResult {
  items: MisJornada[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function useMisJornadas(
  fechaDesde: string,
  fechaHasta: string,
  page: number,
  pageSize: number
) {
  return useQuery<MisJornadasPagedResult, Error>({
    queryKey: ["mis-jornadas", fechaDesde, fechaHasta, page, pageSize],
    queryFn: async () => {
      const response = await jornadaService.getMisJornadas(
        fechaDesde,
        fechaHasta,
        page,
        pageSize
      );

      if (!response.isSuccess) {
        throw new Error(
          response.message || "No se pudieron consultar las jornadas."
        );
      }

      return response.data;
    },
    enabled: Boolean(fechaDesde && fechaHasta),
  });
}