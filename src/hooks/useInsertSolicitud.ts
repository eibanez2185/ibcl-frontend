import { useMutation } from "@tanstack/react-query";

import {
  solicitudService,
  type CrearSolicitudRequest,
} from "@/services/api/solicitudService";

export function useInsertSolicitud() {
  return useMutation({
    mutationFn: (request: CrearSolicitudRequest) =>
      solicitudService.insertSolicitud(request),
  });
}