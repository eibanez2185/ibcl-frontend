import { apiClient } from "./apiClient";
import type { ApiResponse } from "@/types/apiResponse";
import type { MisSolicitudesPagedResult,
  SolicitudesAdministrativasPagedResult,
} from "@/types/solicitud";

export interface CrearSolicitudRequest {
  registroId: number | null;
  idTipoRegistro: number;
  horaActual: string | null;
  horaSolicitada: string | null;
  motivo: string;
}

export interface ConsultaSolicitudesAdministrativasRequest {
  usuariosIds?: number[];
  estado?: string | null;
  fechaDesde: string;
  fechaHasta: string;
  page: number;
  pageSize: number;
}

export interface ResolverSolicitudRequest {
  id: number;
  estado: string;
}


export const solicitudService = {
  async insertSolicitud(
    request: CrearSolicitudRequest,
  ): Promise<ApiResponse<boolean>> {
    return apiClient.post<ApiResponse<boolean>>(
      "/Solicitud/InsertAsync",
      request,
    );
  },

  async getMisSolicitudes(
    fechaDesde: string,
    fechaHasta: string,
    page: number,
    pageSize: number,
  ): Promise<ApiResponse<MisSolicitudesPagedResult>> {
    return apiClient.get<ApiResponse<MisSolicitudesPagedResult>>(
      `/Solicitud/GetMisSolicitudesAsync?fechaDesde=${encodeURIComponent(fechaDesde)}&fechaHasta=${encodeURIComponent(fechaHasta)}&page=${page}&pageSize=${pageSize}`,
    );
  },

    async getSolicitudesAdministrativas(
    filtros: ConsultaSolicitudesAdministrativasRequest,
  ): Promise<ApiResponse<SolicitudesAdministrativasPagedResult>> {
    return apiClient.post<ApiResponse<SolicitudesAdministrativasPagedResult>>(
      "/Solicitud/GetSolicitudesAdministrativasAsync",
      filtros,
    );
  },

    async updateSolicitud(
    request: ResolverSolicitudRequest,
  ): Promise<ApiResponse<boolean>> {
    return apiClient.put<ApiResponse<boolean>>(
      "/Solicitud/UpdateAsync",
      request,
    );
  },


};