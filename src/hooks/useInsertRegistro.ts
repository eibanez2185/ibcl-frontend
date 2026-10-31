import { useMutation } from "@tanstack/react-query"
import { jornadaService } from "@/services/api/jornadaService"

export function useInsertRegistro() {
  return useMutation({
    mutationFn: (tipoRegistroId: number) =>
      jornadaService.insertRegistro(tipoRegistroId),
  })
}