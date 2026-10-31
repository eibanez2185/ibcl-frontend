export interface Novedad {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  tipoNovedadId: number;
  tipoNovedadNombre: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string | null;
  estado: string;
  createdAt: string;
  updatedAt: string | null;
  resueltoPor: number | null;
  idEmpresa: number | null;
}

export interface MisNovedadesPagedResult {
  items: Novedad[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface NovedadesAdministrativasPagedResult {
  items: Novedad[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}