import { useQuery } from "@tanstack/react-query";

import { solicitudService } from "@/services/api/solicitudService";
import type { MisSolicitudesPagedResult } from "@/types/solicitud";

export function useMisSolicitudes(
  fechaDesde: string,
  fechaHasta: string,
  page: number,
  pageSize: number,
) {
  return useQuery<MisSolicitudesPagedResult, Error>({
    queryKey: [
      "mis-solicitudes",
      fechaDesde,
      fechaHasta,
      page,
      pageSize,
    ],

    queryFn: async () => {
      const response = await solicitudService.getMisSolicitudes(
        fechaDesde,
        fechaHasta,
        page,
        pageSize,
      );

      if (!response.isSuccess) {
        throw new Error(
          response.message || "No se pudieron consultar las solicitudes.",
        );
      }

      return response.data;
    },

    enabled: Boolean(fechaDesde && fechaHasta),
  });
}