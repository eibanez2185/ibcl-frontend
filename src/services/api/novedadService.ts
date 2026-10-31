import { apiClient } from "./apiClient";
import type { ApiResponse } from "@/types/apiResponse";
import type {
  MisNovedadesPagedResult,
  NovedadesAdministrativasPagedResult,
} from "@/types/novedad";

export interface ConsultaMisNovedadesRequest {
  fechaDesde: string | null;
  fechaHasta: string | null;
  estado: string | null;
  tipoNovedadId: number | null;
  incluirInactivos: boolean;
  page: number;
  pageSize: number;
}

export interface CrearNovedadRequest {
  tipoNovedadId: number;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string | null;
}

export interface ConsultaNovedadesAdministrativasRequest {
  usuariosIds?: number[];
  estado?: string | null;
  tipoNovedadId?: number | null;
  fechaDesde: string;
  fechaHasta: string;
  page: number;
  pageSize: number;
}

export interface ResolverNovedadRequest {
  id: number;
  estado: string;
}

export const novedadService = {
  async getMisNovedades(
    request: ConsultaMisNovedadesRequest,
  ): Promise<ApiResponse<MisNovedadesPagedResult>> {
    return apiClient.post<ApiResponse<MisNovedadesPagedResult>>(
      "/Novedad/GetMisNovedadesAsync",
      request,
    );
  },

  async getNovedadesAdministrativas(
    filtros: ConsultaNovedadesAdministrativasRequest,
  ): Promise<ApiResponse<NovedadesAdministrativasPagedResult>> {
    return apiClient.post<ApiResponse<NovedadesAdministrativasPagedResult>>(
      "/Novedad/GetNovedadesAdministrativasAsync",
      filtros,
    );
  },

    async crearNovedad(
        request: CrearNovedadRequest,
        ): Promise<ApiResponse<boolean>> {
        return apiClient.post<ApiResponse<boolean>>(
            "/Novedad/InsertAsync",
            request,
        );
    },

    async updateNovedad(
    request: ResolverNovedadRequest,
    ): Promise<ApiResponse<boolean>> {
      return apiClient.put<ApiResponse<boolean>>(
        "/Novedad/UpdateAsync",
        request,
      );
    },

};