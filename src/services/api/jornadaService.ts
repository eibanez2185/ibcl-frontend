import { apiClient } from "./apiClient"
import type { ApiResponse } from "@/types/apiResponse"
import type { MisJornada, MiJornadaHoy } from "@/types/jornada"

export interface MisJornadasPagedResult {
  items: MisJornada[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export const jornadaService = {
  async getMiJornadaHoy(): Promise<ApiResponse<MiJornadaHoy>> {
    return apiClient.get<ApiResponse<MiJornadaHoy>>(
      "/RegistroJornada/GetMiJornadaHoyAsync"
    )
  },

  async getMisJornadas(
    fechaDesde: string,
    fechaHasta: string,
    page: number,
    pageSize: number
  ): Promise<ApiResponse<MisJornadasPagedResult>> {
    return apiClient.get<ApiResponse<MisJornadasPagedResult>>(
      `/RegistroJornada/GetMisJornadasAsync?fechaDesde=${encodeURIComponent(fechaDesde)}&fechaHasta=${encodeURIComponent(fechaHasta)}&page=${page}&pageSize=${pageSize}`
    )
  },

  async insertRegistro(tipoRegistroId: number): Promise<ApiResponse<boolean>> {
    return apiClient.post<ApiResponse<boolean>>(
      "/RegistroJornada/InsertAsync",
      {
        tipoRegistroId,
      }
    )
  },
}

