import { useQuery } from "@tanstack/react-query";

import { solicitudService } from "@/services/api/solicitudService";
import type {
  ConsultaSolicitudesAdministrativasRequest,
  } from "@/services/api/solicitudService";
import type { SolicitudesAdministrativasPagedResult } from "@/types/solicitud";

export function useSolicitudesAdministrativas(
  filtros: ConsultaSolicitudesAdministrativasRequest,
) {
  return useQuery<SolicitudesAdministrativasPagedResult, Error>({
    queryKey: [
      "solicitudes-administrativas",
      filtros.usuariosIds,
      filtros.estado,
      filtros.fechaDesde,
      filtros.fechaHasta,
      filtros.page,
      filtros.pageSize,
    ],

    queryFn: async () => {
      const response =
        await solicitudService.getSolicitudesAdministrativas(filtros);

      if (!response.isSuccess) {
        throw new Error(
          response.message ||
            "No se pudieron consultar las solicitudes administrativas.",
        );
      }

      return response.data;
    },

    enabled: Boolean(filtros.fechaDesde && filtros.fechaHasta),
  });
}