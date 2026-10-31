import { apiClient } from "./apiClient";

import type { TipoNovedad } from "@/types/tipoNovedad";
import type { ApiResponse } from "@/types/apiResponse";

async function getTiposNovedad(): Promise<ApiResponse<TipoNovedad[]>> {
  return apiClient.get<ApiResponse<TipoNovedad[]>>(
    "/TipoNovedad/GetAllAsync?incluirInactivos=false",
  );
}

export const tipoNovedadService = {
  getTiposNovedad,
};