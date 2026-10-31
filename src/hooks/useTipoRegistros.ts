import { useQuery } from "@tanstack/react-query";
import { tipoRegistroService } from "@/services/api/tipoRegistroService";

export function useTipoRegistros() {
  return useQuery({
    queryKey: ["tipoRegistros"],
    queryFn: async () => {
      const response = await tipoRegistroService.getTiposRegistro();

      if (!response.isSuccess) {
        throw new Error(
          response.message ?? "No se pudieron obtener los tipos de registro.",
        );
      }

      return response.data;
    },
  });
}