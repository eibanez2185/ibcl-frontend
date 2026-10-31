import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  firmaUsuarioService,
  type GuardarFirmaUsuarioRequest,
} from "@/services/api/firmaUsuarioService";

export function useGuardarFirma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: GuardarFirmaUsuarioRequest) =>
      firmaUsuarioService.guardarFirma(request),

    onSuccess: (response) => {
      if (response.isSuccess) {
        queryClient.invalidateQueries({
          queryKey: ["mi-firma"],
        });
      }
    },
  });
}