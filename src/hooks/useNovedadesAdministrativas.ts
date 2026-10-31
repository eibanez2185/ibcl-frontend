import { useQuery } from "@tanstack/react-query";

import { novedadService } from "@/services/api/novedadService";
import type {
  ConsultaNovedadesAdministrativasRequest,
} from "@/services/api/novedadService";
import type { NovedadesAdministrativasPagedResult } from "@/types/novedad";

export function useNovedadesAdministrativas(
  filtros: ConsultaNovedadesAdministrativasRequest,
) {
  return useQuery<NovedadesAdministrativasPagedResult, Error>({
    queryKey: [
      "novedades-administrativas",
      filtros.usuariosIds,
      filtros.estado,
      filtros.tipoNovedadId,
      filtros.fechaDesde,
      filtros.fechaHasta,
      filtros.page,
      filtros.pageSize,
    ],

    queryFn: async () => {
      const response =
        await novedadService.getNovedadesAdministrativas(filtros);

      if (!response.isSuccess) {
        throw new Error(
          response.message ||
            "No se pudieron consultar las novedades administrativas.",
        );
      }

      return response.data;
    },

    enabled: Boolean(filtros.fechaDesde && filtros.fechaHasta),
  });
}