import { apiClient } from "./apiClient";
import type { ApiResponse } from "@/types/apiResponse";

export interface FirmaUsuario {
  imagenFirma: string;
  formato: string;
}

export interface GuardarFirmaUsuarioRequest {
  imagenFirma: string;
  formato: "image/png";
}

export const firmaUsuarioService = {
  async obtenerFirma(): Promise<ApiResponse<FirmaUsuario | null>> {
    return apiClient.get<ApiResponse<FirmaUsuario | null>>(
      "/FirmaUsuario/ObtenerAsync",
    );
  },

  async guardarFirma(
    request: GuardarFirmaUsuarioRequest,
  ): Promise<ApiResponse<boolean>> {
    return apiClient.post<ApiResponse<boolean>>(
      "/FirmaUsuario/GuardarAsync",
      request,
    );
  },
};