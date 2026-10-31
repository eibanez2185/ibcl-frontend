import { apiClient } from "./apiClient";

import type { TipoRegistro } from "@/types/tipoRegistro";

import type { ApiResponse } from "@/types/apiResponse";

async function getTiposRegistro(): Promise<ApiResponse<TipoRegistro[]>> {
  return apiClient.get<ApiResponse<TipoRegistro[]>>(
    "/TipoRegistro/GetAllAsync?incluirInactivos=false",
  );
}

export const tipoRegistroService = {
  getTiposRegistro,
};