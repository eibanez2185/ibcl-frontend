import { useMutation } from "@tanstack/react-query";

import {
  novedadService,
  type CrearNovedadRequest,
} from "@/services/api/novedadService";

export function useInsertNovedad() {
  return useMutation({
    mutationFn: (request: CrearNovedadRequest) =>
      novedadService.crearNovedad(request),
  });
}