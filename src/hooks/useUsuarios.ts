import { useQuery } from "@tanstack/react-query";

import { usuarioService } from "@/services/api/usuarioService";
import type { UsuariosPagedResult } from "@/services/api/usuarioService";

export function useUsuarios(page: number, pageSize: number) {
  return useQuery<UsuariosPagedResult, Error>({
    queryKey: ["usuarios", page, pageSize],

    queryFn: async () => {
      const response = await usuarioService.getByEmpresa(
        page,
        pageSize,
      );

      if (!response.isSuccess) {
        throw new Error(
          response.message || "No se pudieron consultar los usuarios.",
        );
      }

      return response.data;
    },
  });
}