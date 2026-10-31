import { apiClient } from './apiClient'
import type { Empresa } from '@/types/empresa'
import type { ApiResponse } from '@/types/apiResponse'

async function getEmpresas(): Promise<ApiResponse<Empresa[]>> {
  return apiClient.get<ApiResponse<Empresa[]>>(
    '/Empresa/GetAllAsync?incluirInactivas=false',
  )
}

export const empresasService = {
  getEmpresas,
}