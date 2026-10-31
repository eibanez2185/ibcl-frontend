import { apiClient } from "./apiClient";

import type { CurrentUser } from "@/types/currentUser";
import type { ApiResponse } from "@/types/apiResponse";

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  cargo: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string | null;
  idEmpresa: number | null;
}

export interface UsuariosPagedResult {
  items: Usuario[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

async function getCurrentUser(): Promise<CurrentUser> {
  return apiClient.get<CurrentUser>(
    "/Usuario/CurrentUser",
  );
}

async function getByEmpresa(
  page: number,
  pageSize: number,
): Promise<ApiResponse<UsuariosPagedResult>> {
  return apiClient.get<ApiResponse<UsuariosPagedResult>>(
    `/Usuario/GetByEmpresaAsync?page=${page}&pageSize=${pageSize}`,
  );
}

export const usuarioService = {
  getCurrentUser,
  getByEmpresa,
};