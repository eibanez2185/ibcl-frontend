import { useQuery } from "@tanstack/react-query"
import { jornadaService } from "@/services/api/jornadaService"

export function useMiJornadaHoy() {
  return useQuery({
    queryKey: ["mi-jornada-hoy"],
    queryFn: async () => {
      const response = await jornadaService.getMiJornadaHoy()

      if (!response.isSuccess || !response.data) {
        throw new Error(
          response.message || "No se pudo consultar la jornada de hoy."
        )
      }

      return response.data
    },
  })
}