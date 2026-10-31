import { useQuery } from "@tanstack/react-query";

import { tipoNovedadService } from "@/services/api/tipoNovedadService";

export function useTipoNovedades() {
  return useQuery({
    queryKey: ["tipoNovedades"],
    queryFn: async () => {
      const response = await tipoNovedadService.getTiposNovedad();

      if (!response.isSuccess) {
        throw new Error(
          response.message ?? "No se pudieron obtener los tipos de novedad.",
        );
      }

      return response.data;
    },
  });
}