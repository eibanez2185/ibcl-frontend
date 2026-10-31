import { useQuery } from "@tanstack/react-query";

import { firmaUsuarioService } from "@/services/api/firmaUsuarioService";

export function useObtenerFirma() {
  return useQuery({
    queryKey: ["mi-firma"],
    queryFn: async () => {
      const response = await firmaUsuarioService.obtenerFirma();

      if (!response.isSuccess) {
        throw new Error(
          response.message || "No se pudo consultar la firma guardada.",
        );
      }

      return response.data;
    },
  });
}