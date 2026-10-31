import { useQuery } from '@tanstack/react-query'
import { empresasService } from '@/services/api/empresasService'

export function useEmpresas() {
  return useQuery({
    queryKey: ['empresas'],
    queryFn: () => empresasService.getEmpresas(),
  })
}